import { useState, useRef } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { Video } from "expo-av";

export default function App() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [recording, setRecording] = useState(false);
  const cameraRef = useRef(null);
  const [videoSource, setVideoSource] = useState(null);

  if (!permission) {
    // 相机权限仍在加载中
    return <View />;
  }

  if (!permission.granted) {
    // 相机权限尚未被授予
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>我们需要您的权限来显示相机</Text>
        <Button onPress={requestPermission} title="授予权限" />
      </View>
    );
  }

  async function startRecording() {
    if (cameraRef.current) {
      try {
        const videoRecordPromise = cameraRef.current.recordAsync();
        if (videoRecordPromise) {
          setRecording(true);
          const data = await videoRecordPromise;
          cameraRef.current.stopRecording();
          setVideoSource(data.uri);
        }
      } catch (error) {
        console.error("录制视频时出错：", error);
      }
    }
  }

  function stopRecording() {
    setRecording(false);
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  }

  function toggleCameraType() {
    setRecording(false);
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  return (
    <View style={styles.container}>
      {videoSource ? (
        <View style={styles.fullScreenContainer}>
          <Video
            source={{ uri: videoSource }}
            style={styles.camera}
            useNativeControls
            resizeMode="contain"
            shouldPlay
            isLooping
          />
          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => setVideoSource(null)}
          >
            <Text style={styles.exitText}>退出播放</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Camera style={styles.camera} type={type} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            {recording ? (
              <TouchableOpacity style={styles.button} onPress={stopRecording}>
                <Text style={styles.text}>停止录制</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.button} onPress={startRecording}>
                <Text style={styles.text}>开始录制</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
              <Text style={styles.text}>切换摄像头</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    marginVertical: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  fullScreenContainer: {
    flex: 1,
    marginVertical: 50,
  },
  exitButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: "transparent",
    padding: 16,
  },
  exitText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});
