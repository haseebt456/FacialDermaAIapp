import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Dimensions,
  InteractionManager,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { predictionService, Prediction } from "../services/predictionService";
import { authService } from "../services/authService";
import Loading from "../components/Loading";

const { width } = Dimensions.get("window");

// Colors matching the design
const COLORS = {
  background: "#f7fafb",
  primary: "#2b6cb0",
  secondary: "#d6f6f1",
  card: "#ffffff",
  text: "#1a365d",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  border: "#e2e8f0",
  success: "#48bb78",
  error: "#e53e3e",
  warning: "#ed8936",
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export default function PredictionScreen({ navigation }: any) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [createdPredictionId, setCreatedPredictionId] = useState<string | null>(null);
  const [latestPrediction, setLatestPrediction] = useState<Prediction | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check user role and redirect dermatologists
  useEffect(() => {
    const checkRole = async () => {
      const user = await authService.getStoredUser();
      setUserRole(user?.role || null);

      if (user?.role === "dermatologist") {
        // Wait for interactions to complete before showing alert
        InteractionManager.runAfterInteractions(() => {
          setTimeout(() => {
            Alert.alert(
              "Access Restricted",
              "Analysis feature is only available for patients. Dermatologists can review patient analyses from the Reviews section.",
              [{ text: "OK", onPress: () => navigation.goBack() }]
            );
          }, 100);
        });
      }
    };
    checkRole();
  }, [navigation]);

  const validateAsset = (asset: {
    uri?: string | null;
    fileSize?: number | null;
    type?: string | null;
  }) => {
    if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) {
      Alert.alert("Image Too Large", "Please choose an image under 5MB.");
      return false;
    }
    if (asset.type && !asset.type.startsWith("image/")) {
      Alert.alert("Invalid File", "Please select an image file (jpg, png, etc.).");
      return false;
    }
    return true;
  };

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
        if (!validateAsset(asset)) return;
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
        if (!validateAsset(asset)) return;
        setSelectedImage(asset.uri || null);
        setPrediction(null);
      }
    });
  };

  const pickImage = () => {
    console.log("pickImage called");
    InteractionManager.runAfterInteractions(() => {
      Alert.alert("Select Image", "Choose an option", [
        { text: "Camera", onPress: openCamera },
        { text: "Gallery", onPress: openGallery },
        { text: "Cancel", style: "cancel" },
      ]);
    });
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
        `Detected: ${result.data.predicted_label}\nConfidence: ${(
          result.data.confidence_score * 100
        ).toFixed(1)}%`
      );
      // Wait a moment for backend to save, then fetch to get the prediction ID
      setTimeout(async () => {
        const list = await predictionService.getPredictions();
        if (list.success && list.data && list.data.length > 0) {
          const sortedPredictions = [...list.data].sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setCreatedPredictionId(sortedPredictions[0].id);
          setLatestPrediction(sortedPredictions[0]);
        }
      }, 1500);
    } else {
      const errorLower = result.error?.toLowerCase() || "";
      if (errorLower.includes("blur")) {
        Alert.alert(
          "Image Too Blurry",
          "The image quality is not clear enough. Please take another photo with better focus and lighting."
        );
      } else if (errorLower.includes("no face")) {
        Alert.alert(
          "No Face Detected",
          "Please ensure your face is clearly visible in the image and try again."
        );
      } else {
        Alert.alert("Analysis Failed", result.error);
      }
    }
  };

  const getConditionColor = (label: string) => {
    const colorMap: any = {
      Acne: "#e53e3e",
      Melanoma: "#805ad5",
      Normal: "#48bb78",
      Perioral_Dermatitis: "#ed8936",
      Rosacea: "#f56565",
      Warts: "#718096",
    };
    return colorMap[label] || COLORS.primary;
  };

  const lowConfidence = prediction && prediction.confidence_score < 0.6;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Block dermatologists from accessing analysis
  if (userRole === "dermatologist") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Analysis</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.content}>
          <View style={styles.restrictedCard}>
            <Text style={styles.restrictedIcon}>🚫</Text>
            <Text style={styles.restrictedTitle}>Access Restricted</Text>
            <Text style={styles.restrictedText}>
              Analysis feature is only available for patients. As a dermatologist, you can
              review patient analyses from the Reviews section.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Results view after analysis
  if (prediction) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analysis Results</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Result Card */}
          <View style={styles.resultCard}>
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

              {lowConfidence && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningTitle}>⚠️ Low Confidence</Text>
                  <Text style={styles.warningText}>
                    Confidence is below 60%. Please retake the photo with better lighting
                    and ensure your face is centered.
                  </Text>
                </View>
              )}

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Report ID</Text>
                <Text style={styles.metaValue}>{createdPredictionId || "Pending"}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>
                  {formatDate(latestPrediction?.createdAt) || "Just now"}
                </Text>
              </View>

              <Text style={styles.disclaimer}>
                ⚠️ This is an AI-based prediction. Please consult a dermatologist for
                proper diagnosis and treatment.
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  if (createdPredictionId) {
                    navigation.navigate("SelectDermatologist", {
                      predictionId: createdPredictionId,
                    });
                  } else {
                    Alert.alert(
                      "Prediction Not Found",
                      "We could not locate this prediction. Please go to History and request a review from there.",
                      [
                        {
                          text: "Go to History",
                          onPress: () => navigation.navigate("History"),
                        },
                        { text: "Cancel", style: "cancel" },
                      ]
                    );
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>👨‍⚕️ Request Expert Review</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setSelectedImage(null);
                  setPrediction(null);
                  setCreatedPredictionId(null);
                }}
              >
                <Text style={styles.secondaryButtonText}>Analyze Another</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Main upload view
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Analysis</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.avatarIcon}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.pageTitle}>Upload Facial Photo</Text>
          <Text style={styles.pageSubtitle}>
            For accurate AI diagnosis, please follow the guidelines below.
          </Text>
        </View>

        {/* Upload Area */}
        <TouchableOpacity
          style={styles.uploadCard}
          onPress={pickImage}
          activeOpacity={0.7}
          delayPressIn={0}
        >
          {!selectedImage ? (
            <View style={styles.uploadArea} pointerEvents="none">
              <View style={styles.cameraIconContainer}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
              <Text style={styles.uploadTitle}>Tap to Upload</Text>
              <Text style={styles.uploadSubtitle}>
                Take a new photo or select from your gallery
              </Text>
              <View style={styles.securityBadge}>
                <Text style={styles.securityIcon}>🔒</Text>
                <Text style={styles.securityText}>Encrypted & Secure</Text>
              </View>
            </View>
          ) : (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
                <Text style={styles.changeImageText}>🔄 Change Image</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>

        {/* Photo Guidelines */}
        <View style={styles.guidelinesSection}>
          <Text style={styles.guidelinesTitle}>Photo Guidelines</Text>

          <View style={styles.guidelineItem}>
            <View style={styles.guidelineIconContainer}>
              <Text style={styles.guidelineIcon}>💡</Text>
            </View>
            <View style={styles.guidelineContent}>
              <Text style={styles.guidelineItemTitle}>Good Lighting</Text>
              <Text style={styles.guidelineItemText}>
                Ensure your face is evenly lit. Avoid strong shadows or dark rooms.
              </Text>
            </View>
            <View style={styles.guidelineCheck}>
              <Text style={styles.checkIcon}>○</Text>
            </View>
          </View>

          <View style={styles.guidelineItem}>
            <View style={styles.guidelineIconContainer}>
              <Text style={styles.guidelineIcon}>👓</Text>
            </View>
            <View style={styles.guidelineContent}>
              <Text style={styles.guidelineItemTitle}>Remove Accessories</Text>
              <Text style={styles.guidelineItemText}>
                Please remove glasses, masks, or heavy makeup for best results.
              </Text>
            </View>
            <View style={styles.guidelineCheck}>
              <Text style={styles.checkIcon}>○</Text>
            </View>
          </View>

          <View style={styles.guidelineItem}>
            <View style={styles.guidelineIconContainer}>
              <Text style={styles.guidelineIcon}>😐</Text>
            </View>
            <View style={styles.guidelineContent}>
              <Text style={styles.guidelineItemTitle}>Neutral Expression</Text>
              <Text style={styles.guidelineItemText}>
                Keep a neutral expression with your face centered in the frame.
              </Text>
            </View>
            <View style={styles.guidelineCheck}>
              <Text style={styles.checkIcon}>○</Text>
            </View>
          </View>

          <View style={styles.guidelineItem}>
            <View style={styles.guidelineIconContainer}>
              <Text style={styles.guidelineIcon}>📸</Text>
            </View>
            <View style={styles.guidelineContent}>
              <Text style={styles.guidelineItemTitle}>Clear & Sharp</Text>
              <Text style={styles.guidelineItemText}>
                Avoid blurry images. Hold your device steady when taking the photo.
              </Text>
            </View>
            <View style={styles.guidelineCheck}>
              <Text style={styles.checkIcon}>○</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Analyze Button */}
      <View style={styles.bottomButton}>
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            !selectedImage && styles.analyzeButtonDisabled,
          ]}
          onPress={analyzeSkin}
          disabled={!selectedImage || loading}
        >
          {loading ? (
            <Text style={styles.analyzeButtonText}>Analyzing...</Text>
          ) : (
            <>
              <Text style={styles.analyzeButtonText}>Analyze Skin</Text>
              <Text style={styles.analyzeButtonIcon}>✨</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <Loading message="Analyzing your skin..." />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 28,
    color: COLORS.text,
    fontWeight: "300",
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 20,
  },
  avatarIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  uploadCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 14,
    margin: 12,
    padding: 32,
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  cameraIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  cameraIcon: {
    fontSize: 28,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  securityIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  securityText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },
  previewContainer: {
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  changeImageButton: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  changeImageText: {
    color: COLORS.card,
    fontSize: 14,
    fontWeight: "600",
  },
  guidelinesSection: {
    marginBottom: 100,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },
  guidelineItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  guidelineIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  guidelineIcon: {
    fontSize: 20,
  },
  guidelineContent: {
    flex: 1,
  },
  guidelineItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  guidelineItemText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  guidelineCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  checkIcon: {
    fontSize: 14,
    color: COLORS.primary,
  },
  bottomButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  analyzeButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.card,
    marginRight: 8,
  },
  analyzeButtonIcon: {
    fontSize: 18,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  // Results styles
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resultHeader: {
    padding: 24,
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.card,
    textAlign: "center",
  },
  resultBody: {
    padding: 20,
  },
  confidenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  confidenceLabel: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "600",
  },
  confidenceValue: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: "700",
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  warningBox: {
    backgroundColor: "#FFF8E6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.warning,
    marginBottom: 6,
  },
  warningText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metaLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  metaValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.card,
  },
  secondaryButton: {
    backgroundColor: COLORS.background,
    borderRadius: 28,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  // Restricted view
  restrictedCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginTop: 40,
  },
  restrictedIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 10,
  },
  restrictedText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
