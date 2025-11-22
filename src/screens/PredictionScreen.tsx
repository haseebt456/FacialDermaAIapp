import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { predictionService } from "../services/predictionService";
import CustomButton from "../components/CustomButton";
import Card from "../components/Card";
import Loading from "../components/Loading";
import ScreenContainer from "../components/ScreenContainer";
import { colors, spacing, typography, shadows, borderRadius } from "../styles/theme";

export default function PredictionScreen({ navigation }: any) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [createdPredictionId, setCreatedPredictionId] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs camera permission to take photos",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Camera permission is required to take photos");
      return;
    }

    const options = {
      mediaType: "photo" as const,
      quality: 1 as const,
      maxWidth: 1024,
      maxHeight: 1024,
      saveToPhotos: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled camera");
      } else if (response.errorCode) {
        Alert.alert("Error", response.errorMessage || "Failed to open camera");
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setSelectedImage(asset.uri || null);
        setPrediction(null);
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: "photo" as const,
      quality: 1 as const,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorCode) {
        Alert.alert("Error", response.errorMessage || "Failed to open gallery");
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setSelectedImage(asset.uri || null);
        setPrediction(null);
      }
    });
  };

  const pickImage = () => {
    Alert.alert(
      "Select Image",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: openCamera,
        },
        {
          text: "Gallery",
          onPress: openGallery,
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const analyzeSkin = async () => {
    if (!selectedImage) {
      Alert.alert("No Image Selected", "Please select or capture an image to analyze.");
      return;
    }

    setLoading(true);
    const result = await predictionService.uploadImage(selectedImage);
    setLoading(false);

    if (result.success && result.data) {
      setPrediction(result.data);
      Alert.alert(
        "Analysis Complete",
        `Detected: ${result.data.predicted_label}\nConfidence: ${(result.data.confidence_score * 100).toFixed(1)}%`
      );
      // Wait a moment for backend to save, then fetch to get the prediction ID
      setTimeout(async () => {
        const list = await predictionService.getPredictions();
        if (list.success && list.data && list.data.length > 0) {
          // Get the most recent prediction (sorted by date)
          const sortedPredictions = [...list.data].sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setCreatedPredictionId(sortedPredictions[0].id);
        }
      }, 1500);
    } else {
      const errorLower = result.error?.toLowerCase() || '';
      if (errorLower.includes("blur")) {
        Alert.alert("Image Too Blurry", "The image quality is not clear enough. Please take another photo with better focus and lighting.");
      } else if (errorLower.includes("no face")) {
        Alert.alert("No Face Detected", "Please ensure your face is clearly visible in the image and try again.");
      } else {
        Alert.alert("Analysis Failed", result.error);
      }
    }
  };

  const getConditionColor = (label: string) => {
    const colorMap: any = {
      Acne: colors.acne,
      Melanoma: colors.melanoma,
      Normal: colors.normal,
      Perioral_Dermatitis: colors.perioral,
      Rosacea: colors.rosacea,
      Warts: colors.warts,
    };
    return colorMap[label] || colors.primary;
  };

  return (
    <ScreenContainer
      backgroundColor={colors.backgroundGray}
      withKeyboardAvoid={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AI Skin Analysis</Text>
        <View style={styles.spacer} />
      </View>

      <Card style={styles.uploadCard}>
        {!selectedImage ? (
          <TouchableOpacity style={styles.uploadArea} onPress={pickImage} activeOpacity={0.7}>
            <View style={styles.uploadIconContainer}>
              <Text style={styles.uploadIcon}>📷</Text>
            </View>
            <Text style={styles.uploadText}>Take or Select Photo</Text>
            <Text style={styles.uploadSubtext}>
              Ensure your face is clearly visible with good lighting
            </Text>
          </TouchableOpacity>
        ) : (
          <View>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <CustomButton
              title="Change Image"
              icon="🔄"
              onPress={pickImage}
              variant="outline"
              size="medium"
              fullWidth
              style={styles.changeButton}
            />
          </View>
        )}
      </Card>

      {selectedImage && !prediction && (
        <View style={styles.analyzeButtonContainer}>
          <CustomButton
            title="Analyze Now"
            icon="🔬"
            onPress={analyzeSkin}
            loading={loading}
            size="large"
            fullWidth
          />
        </View>
      )}

      {loading && (
        <Card style={styles.loadingCard}>
          <Loading message="Analyzing image..." />
        </Card>
      )}

      {prediction && (
        <Card style={styles.resultCard}>
          <View
            style={[
              styles.resultHeader,
              { backgroundColor: getConditionColor(prediction.predicted_label) },
            ]}
          >
            <Text style={styles.resultLabel}>
              {prediction.predicted_label.replace(/_/g, " ")}
            </Text>
          </View>
          <View style={styles.resultBody}>
            <View style={styles.confidenceRow}>
              <Text style={styles.confidenceLabel}>Confidence Score:</Text>
              <Text style={styles.confidenceValue}>
                {(prediction.confidence_score * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${prediction.confidence_score * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.disclaimer}>
              ⚠️ This is an AI-based prediction. Please consult a dermatologist for proper diagnosis
              and treatment.
            </Text>
            <CustomButton
              title="Request Expert Review"
              icon="👨‍⚕️"
              onPress={() => {
                if (createdPredictionId) {
                  navigation.navigate('SelectDermatologist', { predictionId: createdPredictionId });
                } else {
                  Alert.alert('Prediction Not Found', 'We could not locate this prediction. Please go to History and request a review from there.', [
                    { text: 'Go to History', onPress: () => navigation.navigate('History') },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }
              }}
              size="large"
              fullWidth
            />
            <CustomButton
              title="Analyze Another"
              onPress={() => {
                setSelectedImage(null);
                setPrediction(null);
                setCreatedPredictionId(null);
              }}
              variant="ghost"
              size="medium"
              fullWidth
              style={styles.resetButton}
            />
          </View>
        </Card>
      )}

      <Card style={styles.infoCard} key="tips">
        <Text style={styles.infoTitle}>Tips for Best Results</Text>
        <Text style={styles.infoItem}>• Ensure good lighting</Text>
        <Text style={styles.infoItem}>• Face should be clearly visible</Text>
        <Text style={styles.infoItem}>• Avoid blurry images</Text>
        <Text style={styles.infoItem}>• Remove glasses if possible</Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  backButton: {
    padding: spacing.sm,
  },
  backText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  spacer: {
    width: 60,
  },
  uploadCard: {
    margin: spacing.lg,
    padding: 0,
    overflow: "hidden",
  },
  uploadArea: {
    padding: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 320,
    backgroundColor: colors.backgroundGray,
  },
  uploadIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  uploadIcon: {
    fontSize: 48,
  },
  uploadText: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  uploadSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
  },
  previewImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  changeButton: {
    margin: spacing.md,
  },
  analyzeButtonContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  loadingCard: {
    margin: spacing.lg,
  },
  resultCard: {
    margin: spacing.lg,
    padding: 0,
    overflow: "hidden",
  },
  resultHeader: {
    padding: spacing.lg,
    alignItems: "center",
  },
  resultLabel: {
    ...typography.h1,
    color: colors.white,
    textAlign: "center",
  },
  resultBody: {
    padding: spacing.lg,
  },
  confidenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  confidenceLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  confidenceValue: {
    ...typography.h2,
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.warning,
    marginBottom: spacing.lg,
    fontWeight: "600",
  },
  resetButton: {
    marginTop: spacing.md,
  },
  infoCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  infoTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoItem: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});
