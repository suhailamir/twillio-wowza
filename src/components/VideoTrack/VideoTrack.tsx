import React, { useRef, useEffect } from 'react';
import { IVideoTrack } from '../../types';
import { styled } from '@material-ui/core/styles';
import { Track } from 'twilio-video';
import useMediaStreamTrack from '../../hooks/useMediaStreamTrack/useMediaStreamTrack';
import useVideoTrackDimensions from '../../hooks/useVideoTrackDimensions/useVideoTrackDimensions';
import WowzaPeerConnectionPublish from '../../utils/lib/WowzaPeerConnectionPublish.js';
import { mungeSDPPublish } from '../../utils/lib/WowzaMungeSDP.js';

const Video = styled('video')({
  width: '100%',
  height: '100%',
});

interface VideoTrackProps {
  track: IVideoTrack;
  isLocal?: boolean;
  priority?: Track.Priority | null;
}

export default function VideoTrack({ track, isLocal, priority }: VideoTrackProps) {
  const ref = useRef<HTMLVideoElement>(null!);
  const mediaStreamTrack = useMediaStreamTrack(track);
  console.log("isLocal ;", isLocal);
  console.log("track ;", track);

  const dimensions = useVideoTrackDimensions(track);
  const isPortrait = (dimensions?.height ?? 0) > (dimensions?.width ?? 0);

  useEffect(() => {
    const el = ref.current;
    el.muted = true;
    if (track.setPriority && priority) {
      track.setPriority(priority);
    }
    track.attach(el);
    return () => {
      track.detach(el);
      if (track.setPriority && priority) {
        // Passing `null` to setPriority will set the track's priority to that which it was published with.
        track.setPriority(null);
      }
    };
  }, [track, priority]);

  // The local video track is mirrored if it is not facing the environment.
  const isFrontFacing = mediaStreamTrack?.getSettings().facingMode !== 'environment';
  const style = {
    transform: isLocal && isFrontFacing ? 'rotateY(180deg)' : '',
    objectFit: isPortrait || track.name.includes('screen') ? ('contain' as const) : ('cover' as const),
  };
  if (!isLocal) {
    return <>
      <Video ref={ref} style={style} id={!isLocal ? 'remoteVideo' : 'localVideo'} />

      <button style={{
        position: "absolute",
        zIndex: 9999
      }} onClick={() => {
        // e.preventDefault();
        console.log("on click started");
        const videoDOM: any = document.getElementById('remoteVideo')
        const videoStream = videoDOM.captureStream(60)
        WowzaPeerConnectionPublish.start({
          wsURL: 'wss://99e349.entrypoint.cloud.wowza.com/webrtc-session.json',
          localStream: videoStream,
          streamInfo: {},
          mediaInfo: {},
          userData: {},
          mungeSDP: mungeSDPPublish,
          onconnectionstatechange: () => { },
          onstop: () => { },
          onstats: undefined,
          onerror: () => { }
        });
      }}>Publish</button>
    </>
  } else {
    return <Video ref={ref} style={style} id={!isLocal ? 'remoteVideo' : 'localVideo'} onClick={() => {
      // e.preventDefault();
      console.log("on click started");
      // const videoDOM: any = $('#localVideo1')[0]
      // const videoStream = videoDOM.captureStream(60)
      // WowzaPeerConnectionPublish.start({
      //   wsURL: 'wss://99e349.entrypoint.cloud.wowza.com/webrtc-session.json',
      //   localStream: videoStream,
      //   streamInfo: {},
      //   mediaInfo: {},
      //   userData: {},
      //   mungeSDP: mungeSDPPublish,
      //   onconnectionstatechange: () => { },
      //   onstop: () => { },
      //   onstats: undefined,
      //   onerror: () => { }
      // });
    }} />;
  }



  // if(!isLocal){
  //     let state = {
  //       publishing: false,
  //       pendingPublish: false,
  //       pendingPublishTimeout: undefined,
  //       muted: false,
  //       video: true,
  //       selectedCam: '',
  //       selectedMic: '',
  //       settings: {
  //         sdpURL: "",
  //         applicationName: "",
  //         streamName: "",
  //         audioBitrate: "64",
  //         audioCodec: "opus",
  //         videoBitrate: "3500",
  //         videoCodec: "42e01f",
  //         videoFrameRate: "30",
  //         frameSize: "default"
  //       }
  //     };

  //     const init = (connected: any, failed: any, stopped: any, errorHandler: any, soundMeter: any) => {
  //       initListeners();
  //       WowzaWebRTCPublish.on({
  //         onStateChanged: (newState: any) => {
  //           console.log("WowzaWebRTCPublish.onStateChanged");
  //           console.log(JSON.stringify(newState));

  //           // LIVE / ERROR Indicator
  //           if (newState.connectionState === 'connected') {
  //             connected();
  //           }
  //           else if (newState.connectionState === 'failed') {
  //             failed();
  //           }
  //           else {
  //             stopped();
  //           }
  //         },
  //         onCameraChanged: (cameraId: any) => {
  //           if (cameraId !== state.selectedCam) {
  //             state.selectedCam = cameraId;
  //             let camSelectValue = 'CameraMobile_' + cameraId;
  //             if (cameraId === 'screen') camSelectValue = 'screen_screen';
  //             $('#camera-list-select').val(camSelectValue);
  //           }
  //         },
  //         onMicrophoneChanged: (microphoneId: any) => {
  //           if (microphoneId !== state.selectedMic) {
  //             state.selectedMic = microphoneId;
  //             $('#mic-list-select').val('MicrophoneMobile_' + microphoneId);
  //           }
  //         },
  //         onError: errorHandler,
  //         onSoundMeter: soundMeter
  //       })
  //       WowzaWebRTCPublish.set({
  //         videoElementPublish: document.getElementById('publisher-video'),
  //         useSoundMeter: true
  //       })
  //         .then((result: any) => {
  //           AvMenu.init(result.cameras, result.microphones);
  //         });
  //     };

  //     const getState = () => {
  //       return state;
  //     }

  //     // throw errors with these messages
  //     const okToStart = () => {
  //       if (state.settings.sdpURL === "") {
  //         throw "No stream configured.";
  //       }
  //       else if (state.settings.applicationName === "") {
  //         throw "Missing application name.";
  //       }
  //       else if (state.settings.streamName === "") {
  //         throw "Missing stream name."
  //       }
  //       return true;
  //     }

  //     const updateFrameSize = (frameSize: any) => {
  //       let constraints = JSON.parse(JSON.stringify(WowzaWebRTCPublish.getState().constraints));
  //       if (frameSize === 'default') {
  //         constraints.video["width"] = { min: "640", ideal: "1280", max: "1920" };
  //         constraints.video["height"] = { min: "360", ideal: "720", max: "1080" };
  //       }
  //       else {
  //         constraints.video["width"] = { exact: frameSize[0] };
  //         constraints.video["height"] = { exact: frameSize[1] };
  //       }
  //       WowzaWebRTCPublish.set({ constraints: constraints });
  //     }

  //     const update = (settings: any) => {
  //       state.settings = settings;
  //       return WowzaWebRTCPublish.set(settings);
  //     }

  //     // start/stop publisher
  //     const start = () => {
  //       if (okToStart()) {
  //         WowzaWebRTCPublish.start();
  //       }
  //     };

  //     const stop = () => {
  //       WowzaWebRTCPublish.stop();
  //     };

  //     const videoOn = () => {
  //       WowzaWebRTCPublish.setVideoEnabled(true);
  //     }
  //     const videoOff = () => {
  //       WowzaWebRTCPublish.setVideoEnabled(false);
  //     }

  //     const audioOn = () => {
  //       WowzaWebRTCPublish.setAudioEnabled(true);
  //     }

  //     const audioOff = () => {
  //       WowzaWebRTCPublish.setAudioEnabled(false);
  //     }

  //     // Helpers




  //     /*
  //       UI updaters
  //     */


  //     const onPublishPeerConnected = () => {
  //       state.publishing = true;
  //       $("#transcoder-warning").hide();
  //       $("#error-messages").html("");
  //       $("#publish-toggle").html("Stop");
  //       $("#video-live-indicator-live").show();
  //       $("#video-live-indicator-error").hide();
  //       $("#publish-settings-form :input").prop("disabled", true);
  //       $("#publish-settings-form :button").prop("disabled", false);
  //     }

  //     const onPublishPeerConnectionFailed = () => {
  //       onPublishPeerConnected();
  //       $("#publish-settings-form :input").prop("disabled", false);
  //       $("#publish-settings-form :button").prop("disabled", false);
  //     }

  //     const onPublishPeerConnectionStopped = () => {
  //       if (!state.pendingPublish) {
  //         state.publishing = false;
  //         $("#publish-toggle").html("Publish");
  //         $("#video-live-indicator-live").hide();
  //         $("#video-live-indicator-error").hide();
  //         $("#publish-settings-form :input").prop("disabled", false);
  //         $("#publish-settings-form :button").prop("disabled", false);
  //       }
  //     }

  //     // Listeners
  //     const initListeners = () => {
  //       $("#mute-toggle").click((e) => {
  //         e.preventDefault()
  //         state.muted = !state.muted
  //         if (state.muted) {
  //           $("#mute-off").css("display", "none");
  //           $("#mute-on").css("display", "inline");
  //           audioOff()
  //         } else {
  //           $("#mute-on").css("display", "none");
  //           $("#mute-off").css("display", "inline");
  //           audioOn();
  //         }
  //       });

  //       $("#camera-toggle").click((e) => {
  //         e.preventDefault()
  //         state.video = !state.video
  //         if (state.video) {
  //           $("#video-on").css("display", "none");
  //           $("#video-off").css("display", "inline");
  //           videoOn();
  //         } else {
  //           $("#video-off").css("display", "none");
  //           $("#video-on").css("display", "inline");
  //           videoOff();
  //         }
  //       });


  //       $("#publish-toggle").click((e) => {
  //         if (state.pendingPublish) {
  //           return;
  //         }
  //         else if (state.publishing) {
  //           stop();
  //         }
  //         else {
  //           start();
  //         }
  //       });
  //     }

  //     const initFormAndSettings = () => {
  //       let pageParams = Settings.mapFromCookie(state.settings);
  //       pageParams = Settings.mapFromQueryParams(pageParams);
  //       Settings.updateForm(pageParams);
  //       if (pageParams.frameSize != null && pageParams.frameSize !== '' && pageParams.frameSize !== 'default') {
  //         updateFrameSize(pageParams.frameSize.split('x'));
  //       }
  //       if (browserDetails.browser === 'safari') {
  //         $("#videoCodec option[value='VP9']").remove();
  //       }
  //     }
  //     initFormAndSettings();
  //     init(onPublishPeerConnected, onPublishPeerConnectionFailed, onPublishPeerConnectionStopped, () => { }, () => { });
  //   };





}
