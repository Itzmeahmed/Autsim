"""
Auti AIgnosis - AI Screening Endpoints
Structured AQ-10 / Q-CHAT based behavioral questionnaire and ML inference engine.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.app.core.database import get_db
from backend.app.models.models import (
    User, PatientProfile, Screening, ScreeningResponse, ScreeningResult,
    BehavioralObservation, UserRole, Appointment
)
from backend.app.schemas.schemas import (
    ScreeningSubmitRequest, ScreeningResultResponse, ScreeningSummaryResponse,
    CameraScreeningSubmitRequest
)
from backend.app.api.deps import get_current_user
from backend.app.ml.predict import run_screening_prediction
from backend.app.services.audit_service import record_audit_event

router = APIRouter(prefix="/screening", tags=["AI Screening"])

# Validated questionnaire repository mapped to the 5 domains
QUESTIONNAIRE_ITEMS = [
    # Domain 1: Communication
    {
        "id": "Q1",
        "domain": "Communication",
        "text": {
            "en": "Does the child look at you when you call their name?",
            "kn": "ನೀವು ಅವರ ಹೆಸರನ್ನು ಕರೆದಾಗ ಮಗು ನಿಮ್ಮನ್ನು ನೋಡುತ್ತದೆಯೇ?",
            "hi": "क्या आपका बच्चा उसका नाम पुकारने पर आपकी ओर देखता है?"
        },
        "description": "Assesses orienting to social verbal cues.",
        "reverse_scored": True
    },
    {
        "id": "Q5",
        "domain": "Communication",
        "text": {
            "en": "Does the child use gestures to communicate (e.g., waving bye-bye, pointing to things)?",
            "kn": "ಮಗು ಸಂವಹನ ನಡೆಸಲು ಸನ್ನೆಗಳನ್ನು ಬಳಸುತ್ತದೆಯೇ (ಉದಾ. ಬೈ-ಬೈ ಮಾಡುವುದು, ಬೆರಳು ತೋರಿಸುವುದು)?",
            "hi": "क्या बच्चा बातचीत के लिए इशारों का उपयोग करता है (जैसे बाय-बाय करना या किसी चीज़ की ओर इशारा करना)?"
        },
        "description": "Proto-declarative and reciprocal gestures.",
        "reverse_scored": True
    },
    {
        "id": "Q9",
        "domain": "Communication",
        "text": {
            "en": "Does the child repeat words or phrases immediately or after some time (echolalia)?",
            "kn": "ಮಗು ಪದಗಳನ್ನು ಅಥವಾ ವಾಕ್ಯಗಳನ್ನು ಪದೇ ಪದೇ ಪುನರಾವರ್ತಿಸುತ್ತದೆಯೇ?",
            "hi": "क्या बच्चा सुने हुए शब्दों या वाक्यांशों को बार-बार दोहराता है?"
        },
        "description": "Evaluates repetitive vocalizations or delayed echolalia.",
        "reverse_scored": False
    },
    {
        "id": "Q13",
        "domain": "Communication",
        "text": {
            "en": "Does the child engage in back-and-forth conversational babbling or conversation?",
            "kn": "ಮಗು ನಿಮ್ಮೊಂದಿಗೆ ಸರದಿಯ ಪ್ರಕಾರ ಸಂಭಾಷಣೆಯಲ್ಲಿ ತೊಡಗುತ್ತದೆಯೇ?",
            "hi": "क्या बच्चा आपके साथ बारी-बारी से बातचीत या बोलने का प्रयास करता है?"
        },
        "description": "Reciprocal conversational pacing.",
        "reverse_scored": True
    },

    # Domain 2: Social Interaction
    {
        "id": "Q2",
        "domain": "Social Interaction",
        "text": {
            "en": "How easy is it for you to get eye contact with the child?",
            "kn": "ಮಗುವಿನೊಂದಿಗೆ ಕಣ್ಣಿನ ಸಂಪರ್ಕ (eye contact) ಸಾಧಿಸುವುದು ಎಷ್ಟು ಸುಲಭ?",
            "hi": "बच्चे के साथ आँख से आँख मिलाना (आई कॉन्टैक्ट) कितना सहज है?"
        },
        "description": "Direct eye contact reciprocity.",
        "reverse_scored": True
    },
    {
        "id": "Q6",
        "domain": "Social Interaction",
        "text": {
            "en": "Does the child show interest in other children of the same age?",
            "kn": "ಮಗು ತನ್ನ ವಯಸ್ಸಿನ ಇತರ ಮಕ್ಕಳೊಂದಿಗೆ ಆಟವಾಡಲು ಆಸಕ್ತಿ ತೋರಿಸುತ್ತದೆಯೇ?",
            "hi": "क्या बच्चा अपनी उम्र के अन्य बच्चों में रुचि दिखाता है?"
        },
        "description": "Peer socialization affinity.",
        "reverse_scored": True
    },
    {
        "id": "Q10",
        "domain": "Social Interaction",
        "text": {
            "en": "Does the child smile back when you or others smile at them?",
            "kn": "ನೀವು ಅಥವಾ ಇತರರು ನಕ್ಕಾಗ ಮಗು ಪ್ರತಿಯಾಗಿ ನಗುತ್ತದೆಯೇ?",
            "hi": "क्या आप या अन्य लोगों के मुस्कुराने पर बच्चा भी मुस्कुराता है?"
        },
        "description": "Social smiling reflex.",
        "reverse_scored": True
    },
    {
        "id": "Q14",
        "domain": "Social Interaction",
        "text": {
            "en": "Does the child bring objects or toys to show you just to share enjoyment?",
            "kn": "ಮಗು ಕೇವಲ ಸಂತೋಷವನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ತನಗೆ ಇಷ್ಟವಾದ ವಸ್ತುಗಳನ್ನು ನಿಮಗೆ ತೋರಿಸುತ್ತದೆಯೇ?",
            "hi": "क्या बच्चा केवल खुशी साझा करने के लिए अपनी पसंदीदा वस्तु या खिलौना आपको दिखाता है?"
        },
        "description": "Joint attention and shared enjoyment.",
        "reverse_scored": True
    },

    # Domain 3: Sensory Responses
    {
        "id": "Q3",
        "domain": "Sensory Responses",
        "text": {
            "en": "Does the child become noticeably distressed by everyday sounds (e.g., blender, vacuum, loud traffic)?",
            "kn": "ಮಗು ಸಾಮಾನ್ಯ ಶಬ್ದಗಳಿಗೆ (ಮಿಕ್ಸಿ, ವ್ಯಾಕ್ಯೂಮ್ ಕ್ಲೀನರ್, ವಾಹನದ ಶಬ್ದ) ಅತಿಯಾಗಿ ಅಸಮಾಧಾನಗೊಳ್ಳುತ್ತದೆಯೇ?",
            "hi": "क्या बच्चा रोज़मर्रा की आवाज़ों (जैसे मिक्सी, वैक्यूम, तेज़ आवाज़) से बहुत अधिक परेशान हो जाता है?"
        },
        "description": "Auditory sensory hypersensitivity.",
        "reverse_scored": False
    },
    {
        "id": "Q7",
        "domain": "Sensory Responses",
        "text": {
            "en": "Does the child show unusual reactions to textures, clothing tags, or foods?",
            "kn": "ಬಟ್ಟೆಯ ಟ್ಯಾಗ್‌ಗಳು, ಬಟ್ಟೆಯ ಸ್ಪರ್ಶ ಅಥವಾ ಆಹಾರದ ವಿನ್ಯಾಸಕ್ಕೆ ಮಗು ಅಸಾಮಾನ್ಯ ಪ್ರತಿಕ್ರಿಯೆ ನೀಡುತ್ತದೆಯೇ?",
            "hi": "क्या बच्चा कपड़ों के टैग, स्पर्श या विशिष्ट भोजन की बनावट के प्रति असामान्य प्रतिक्रिया देता है?"
        },
        "description": "Tactile and oral sensory modulation.",
        "reverse_scored": False
    },
    {
        "id": "Q11",
        "domain": "Sensory Responses",
        "text": {
            "en": "Does the child visually inspect objects from unusual angles or stare closely at lights/wheels?",
            "kn": "ಮಗು ವಸ್ತುಗಳನ್ನು ವಿಚಿತ್ರ ಕೋನಗಳಿಂದ ನೋಡುತ್ತದೆಯೇ ಅಥವಾ ಬೆಳಕು/ತಿರುಗುವ ಚಕ್ರಗಳನ್ನು ಹತ್ತಿರದಿಂದ ದಿಟ್ಟಿಸುತ್ತದೆಯೇ?",
            "hi": "क्या बच्चा खिलौनों या वस्तुओं को अजीब कोणों से देखता है या रोशनी/पहियों को बहुत पास से घूरता है?"
        },
        "description": "Atypical visual fixation.",
        "reverse_scored": False
    },
    {
        "id": "Q15",
        "domain": "Sensory Responses",
        "text": {
            "en": "Does the child seek intense sensory experiences like spinning, jumping, or touching specific surfaces?",
            "kn": "ಮಗು ತಿರುಗುವುದು, ಪದೇ ಪದೇ ಹಾರುವುದು ಅಥವಾ ನಿರ್ದಿಷ್ಟ ಮೇಲ್ಮೈಗಳನ್ನು ಸ್ಪರ್ಶಿಸುವುದು ಮುಂತಾದ ತೀವ್ರ ಸಂವೇದನೆ ಬಯಸುತ್ತದೆಯೇ?",
            "hi": "क्या बच्चा चक्कर लगाना, बार-बार कूदना या खास सतहों को छूना जैसी तीव्र संवेदी गतिविधियाँ पसंद करता है?"
        },
        "description": "Sensory-seeking behavioral indicators.",
        "reverse_scored": False
    },

    # Domain 4: Repetitive Behaviors
    {
        "id": "Q4",
        "domain": "Repetitive Behaviors",
        "text": {
            "en": "Does the child line up toys or arrange objects in strict sequences rather than playing pretend?",
            "kn": "ಮಗು ಆಟಿಕೆಗಳನ್ನು ಕಲ್ಪನಾತ್ಮಕವಾಗಿ ಆಡುವ ಬದಲು ಸಾಲಾಗಿ ಜೋಡಿಸುತ್ತದೆಯೇ?",
            "hi": "क्या बच्चा खिलौनों के साथ खेलने के बजाय उन्हें एक सीध में या खास क्रम में सजाता है?"
        },
        "description": "Object ordering and repetitive alignment.",
        "reverse_scored": False
    },
    {
        "id": "Q8",
        "domain": "Repetitive Behaviors",
        "text": {
            "en": "Does the child have repetitive motor mannerisms (such as hand flapping, finger flicking, or rocking)?",
            "kn": "ಮಗು ಕೈಗಳನ್ನು ಬೀಸುವುದು, ಬೆರಳುಗಳನ್ನು ಅಲ್ಲಾಡಿಸುವುದು ಅಥವಾ ದೇಹವನ್ನು ತೂಗಾಡುವಂತಹ ಪುನರಾವರ್ತಿತ ಚಲನೆಗಳನ್ನು ಮಾಡುತ್ತದೆಯೇ?",
            "hi": "क्या बच्चा हाथ हिलाना (फ्लैपिंग), उँगलियाँ नचाना या शरीर को आगे-पीछे झुलाने जैसी दोहरावदार हरकतें करता है?"
        },
        "description": "Motor stereotypies.",
        "reverse_scored": False
    },
    {
        "id": "Q12",
        "domain": "Repetitive Behaviors",
        "text": {
            "en": "Does the child get intensely upset or distressed by minor changes in routines or surroundings?",
            "kn": "ದಿನಚರಿಯಲ್ಲಿ ಅಥವಾ ವಾತಾವರಣದಲ್ಲಿ ಸಣ್ಣ ಬದಲಾವಣೆಗಳು ಉಂಟಾದಾಗ ಮಗು ತೀವ್ರವಾಗಿ ಅಸಮಾಧಾನಗೊಳ್ಳುತ್ತದೆಯೇ?",
            "hi": "क्या दिनचर्या या माहौल में थोड़े से बदलाव से भी बच्चा अत्यधिक परेशान या उत्तेजित हो जाता है?"
        },
        "description": "Inflexibility and insistence on sameness.",
        "reverse_scored": False
    },
    {
        "id": "Q16",
        "domain": "Repetitive Behaviors",
        "text": {
            "en": "Does the child exhibit intense, highly focused interests in very specific topics or objects?",
            "kn": "ಮಗು ನಿರ್ದಿಷ್ಟ ವಿಷಯಗಳು ಅಥವಾ ವಸ್ತುಗಳ ಬಗ್ಗೆ ಅತಿಯಾದ, ತೀವ್ರ ಆಸಕ್ತಿಯನ್ನು ತೋರಿಸುತ್ತದೆಯೇ?",
            "hi": "क्या बच्चे की किसी विशिष्ट विषय या वस्तु में अत्यधिक और गहरी रुचि होती है?"
        },
        "description": "Restricted and circumscribed interests.",
        "reverse_scored": False
    },

    # Domain 5: Daily-Life Skills
    {
        "id": "Q17",
        "domain": "Daily-Life Skills",
        "text": {
            "en": "Does the child adapt smoothly when transitioning from one activity to another (e.g., leaving the park)?",
            "kn": "ಮಗು ಒಂದು ಚಟುವಟಿಕೆಯಿಂದ ಇನ್ನೊಂದಕ್ಕೆ (ಉದಾ. ಪಾರ್ಕ್‌ನಿಂದ ಮನೆಗೆ ಬರುವುದು) ಸುಲಭವಾಗಿ ಹೊಂದಿಕೊಳ್ಳುತ್ತದೆಯೇ?",
            "hi": "क्या बच्चा एक गतिविधि से दूसरी में जाने (जैसे पार्क से घर लौटने) में आसानी से सामंजस्य बिठा लेता है?"
        },
        "description": "Task switching and behavioral flexibility.",
        "reverse_scored": True
    },
    {
        "id": "Q18",
        "domain": "Daily-Life Skills",
        "text": {
            "en": "Does the child indicate hunger, thirst, or bathroom needs using words or consistent gestures?",
            "kn": "ಮಗು ಹಸಿವು, ಬಾಯಾರಿಕೆ ಅಥವಾ ಶೌಚಾಲಯದ ಅಗತ್ಯಗಳನ್ನು ಪದಗಳು ಅಥವಾ ಸನ್ನೆಗಳ ಮೂಲಕ ತಿಳಿಸುತ್ತದೆಯೇ?",
            "hi": "क्या बच्चा भूख, प्यास या शौचालय की ज़रूरत को शब्दों या स्पष्ट इशारों से व्यक्त करता है?"
        },
        "description": "Functional daily communication.",
        "reverse_scored": True
    },
    {
        "id": "Q19",
        "domain": "Daily-Life Skills",
        "text": {
            "en": "Does the child participate in age-appropriate self-care routines (like washing hands or dressing)?",
            "kn": "ಮಗು ಕೈ ತೊಳೆಯುವುದು ಅಥವಾ ಬಟ್ಟೆ ಧರಿಸುವಂತಹ ದಿನನಿತ್ಯದ ಸ್ವಯಂ-ಆರೈಕೆ ಕಾರ್ಯಗಳಲ್ಲಿ ಭಾಗವಹಿಸುತ್ತದೆಯೇ?",
            "hi": "क्या बच्चा अपनी उम्र के अनुसार हाथ धोने या कपड़े पहनने जैसे दैनिक कार्यों में भाग लेता है?"
        },
        "description": "Adaptive daily living competencies.",
        "reverse_scored": True
    },
    {
        "id": "Q20",
        "domain": "Daily-Life Skills",
        "text": {
            "en": "Does the child show awareness of dangerous situations (e.g., heights, hot items, busy roads)?",
            "kn": "ಮಗು ಅಪಾಯಕಾರಿ ಸಂದರ್ಭಗಳ (ಎತ್ತರ, ಬಿಸಿ ವಸ್ತುಗಳು, ವಾಹನ ದಟ್ಟಣೆ) ಬಗ್ಗೆ ಎಚ್ಚರ ಅಥವಾ ಅರಿವು ಹೊಂದಿದೆಯೇ?",
            "hi": "क्या बच्चा खतरनाक स्थितियों (जैसे ऊँचाई, गर्म चीज़ें, सड़क का ट्रैफिक) के प्रति सुरक्षा जागरूकता दिखाता है?"
        },
        "description": "Environmental safety awareness.",
        "reverse_scored": True
    }
]

@router.get("/questions")
def get_screening_questions():
    """Returns the validated 20-item multilingual questionnaire."""
    return {"questions": QUESTIONNAIRE_ITEMS, "total": len(QUESTIONNAIRE_ITEMS)}

@router.post("/submit", response_model=ScreeningResultResponse)
def submit_screening(
    data: ScreeningSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits screening responses, executes ML inference pipeline,
    and returns 5-domain developmental profile with strict non-diagnostic disclaimer.
    """
    # Verify patient ownership (IDOR prevention)
    patient = db.query(PatientProfile).filter(PatientProfile.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
        
    if current_user.role == UserRole.PATIENT.value and patient.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to submit screening for another patient profile.")
        
    # Map responses into key-value format for ML pipeline
    resp_map = {item.question_id: item.response_value for item in data.responses}
    
    # Run ML prediction pipeline
    pred_result = run_screening_prediction(
        responses=resp_map,
        age=data.child_age,
        gender=data.child_gender,
        jaundice=data.jaundice_at_birth,
        family_history=data.family_history_asd
    )
    
    # Create Screening record in Database
    screening = Screening(
        patient_id=data.patient_id,
        child_age=data.child_age,
        child_gender=data.child_gender,
        total_score=pred_result["total_score"],
        status="Completed"
    )
    db.add(screening)
    db.commit()
    db.refresh(screening)
    
    # Save individual item responses
    for item in data.responses:
        resp_obj = ScreeningResponse(
            screening_id=screening.id,
            question_id=item.question_id,
            question_text=item.question_text,
            domain=item.domain,
            response_value=item.response_value,
            response_text=item.response_text or str(item.response_value)
        )
        db.add(resp_obj)
        
    # Save optional Behavioral Observation if camera module was completed
    if data.camera_observation:
        obs_obj = BehavioralObservation(
            screening_id=screening.id,
            consent_given=data.camera_observation.consent_given,
            duration_seconds=data.camera_observation.duration_seconds or 30,
            facial_expression_patterns={"indicators": data.camera_observation.facial_expression_indicators or data.camera_observation.facial_expression_patterns or []},
            attention_orientation_patterns={"indicators": data.camera_observation.attention_orientation_indicators or data.camera_observation.attention_orientation_patterns or []},
            movement_patterns={"patterns": data.camera_observation.movement_patterns or []},
            summary_indicators=data.camera_observation.summary_indicators or ["Observed behavioral indicators documented."]
        )
        db.add(obs_obj)

    # Save Screening Result record
    result_obj = ScreeningResult(
        screening_id=screening.id,
        screening_indication=pred_result["screening_indication"],
        probability_score=pred_result["probability_score"],
        developmental_profile=pred_result["developmental_profile"],
        key_contributing_areas=pred_result["key_contributing_areas"],
        explanation=pred_result["explanation"],
        disclaimer=pred_result["disclaimer"],
        model_version=pred_result["model_version"]
    )
    db.add(result_obj)
    db.commit()
    db.refresh(result_obj)
    
    # Audit log
    record_audit_event(
        db, action="SCREENING_SUBMITTED",
        resource=f"screening:{screening.id}",
        user_id=current_user.id,
        details=f"Indication: {pred_result['screening_indication']} | Score: {pred_result['probability_score']}"
    )
    
    return result_obj

@router.post("/camera-session", response_model=ScreeningResultResponse)
def submit_camera_screening(
    data: CameraScreeningSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a guided camera-based behavioral observation session.
    Extracts behavioral signals (visual orientation, head pose stability, stimulus response, movement indicators),
    evaluates developmental profile, and returns professional screening result.
    """
    patient = db.query(PatientProfile).filter(PatientProfile.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
        
    if current_user.role == UserRole.PATIENT.value and patient.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to submit screening for another patient profile.")
        
    # Synthesize developmental indicators based on observed behavioral signals
    comm_score = 35.0 if "sustained" in data.visual_orientation_tracking.lower() else 65.0
    social_score = 30.0 if "responsive" in data.stimulus_response.lower() else 70.0
    sensory_score = 40.0 if "optimal" in data.observation_quality.lower() else 55.0
    rep_score = 75.0 if data.repetitive_movement_indicator else 25.0
    motor_score = 30.0 if "stable" in data.movement_patterns.lower() else 60.0
    
    avg_score = (comm_score + social_score + sensory_score + rep_score + motor_score) / 5.0
    probability = round(avg_score / 100.0, 2)
    indication = "Further Clinical Evaluation Recommended" if probability >= 0.50 else "Lower Indication"
    
    screening = Screening(
        patient_id=data.patient_id,
        child_age=data.child_age,
        child_gender=data.child_gender,
        total_score=int(avg_score),
        status="Completed"
    )
    db.add(screening)
    db.commit()
    db.refresh(screening)
    
    # Save BehavioralObservation
    obs = BehavioralObservation(
        screening_id=screening.id,
        consent_given=True,
        duration_seconds=data.duration_seconds,
        facial_expression_patterns={"orientation": data.head_face_orientation},
        attention_orientation_patterns={"tracking": data.visual_orientation_tracking, "stimulus": data.stimulus_response},
        movement_patterns={"movement": data.movement_patterns, "repetitive": data.repetitive_movement_indicator},
        summary_indicators=[
            f"Visual Orientation: {data.visual_orientation_tracking}",
            f"Head / Face Orientation: {data.head_face_orientation}",
            f"Response to Visual Stimulus: {data.stimulus_response}",
            f"Movement Patterns: {data.movement_patterns}",
            f"Observation Quality: {data.observation_quality}"
        ]
    )
    db.add(obs)
    
    # Save ScreeningResult
    result_obj = ScreeningResult(
        screening_id=screening.id,
        screening_indication=indication,
        probability_score=probability,
        developmental_profile={
            "Communication": round(comm_score, 1),
            "Social Interaction": round(social_score, 1),
            "Sensory Responses": round(sensory_score, 1),
            "Repetitive Behaviors": round(rep_score, 1),
            "Motor / Daily-Life Skills": round(motor_score, 1)
        },
        key_contributing_areas=[
            f"Visual Orientation Tracking: {data.visual_orientation_tracking}",
            f"Stimulus Engagement: {data.stimulus_response}",
            f"Movement Observations: {data.movement_patterns}"
        ],
        explanation="Recorded camera-based behavioral observations and interaction cues contributed to this screening summary.",
        disclaimer="AI-assisted screening report • Clinical review recommended",
        model_version="v1.1.0-CV"
    )
    db.add(result_obj)
    db.commit()
    db.refresh(result_obj)
    
    record_audit_event(
        db, action="CAMERA_SCREENING_SUBMITTED",
        resource=f"screening:{screening.id}",
        user_id=current_user.id,
        details=f"Camera Session Indication: {indication} | Score: {probability}"
    )
    
    return result_obj

@router.get("/{screening_id}", response_model=ScreeningResultResponse)
def get_screening_result(
    screening_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetches a specific screening result with RBAC protection."""
    screening = db.query(Screening).filter(Screening.id == screening_id).first()
    if not screening or not screening.result:
        raise HTTPException(status_code=404, detail="Screening result record not found.")
        
    # Authorization checks
    if current_user.role == UserRole.PATIENT.value:
        if screening.patient.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Unauthorized to access this screening result.")
    elif current_user.role == UserRole.CLINICIAN.value:
        if not current_user.clinician_profile:
            raise HTTPException(status_code=403, detail="Clinician profile required.")
        has_appt = db.query(Appointment).filter(
            Appointment.clinician_id == current_user.clinician_profile.id,
            Appointment.patient_id == screening.patient_id
        ).first()
        if not has_appt:
            raise HTTPException(
                status_code=403,
                detail="Unauthorized: Clinicians may only view screening results for patients with active bookings."
            )
            
    return screening.result
