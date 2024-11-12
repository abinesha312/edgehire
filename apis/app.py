import streamlit as st
import cv2
import av
from streamlit_webrtc import webrtc_streamer, VideoProcessorBase, RTCConfiguration

class VideoProcessor(VideoProcessorBase):
    def recv(self, frame):
        img = frame.to_ndarray(format="bgr24")
        
        # Simple edge detection filter
        img = cv2.cvtColor(cv2.Canny(img, 100, 200), cv2.COLOR_GRAY2BGR)
        
        return av.VideoFrame.from_ndarray(img, format="bgr24")

def main():
    st.title("Streamlit WebRTC Demo")

    st.write("This app demonstrates real-time video processing using WebRTC and OpenCV.")

    webrtc_ctx = webrtc_streamer(
        key="example",
        video_processor_factory=VideoProcessor,
        rtc_configuration=RTCConfiguration(
            {"iceServers": [{"urls": ["stun:stun.l.google.com:19302"]}]}
        )
    )

    if webrtc_ctx.video_processor:
        st.write("Video processing is ON")
    else:
        st.write("Video processing is OFF")

if __name__ == "__main__":
    main()
