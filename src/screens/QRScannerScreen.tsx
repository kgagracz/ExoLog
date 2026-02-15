import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import {Theme} from "../styles/theme";
import {useNavigation} from "@react-navigation/native";
import { animalsService } from "../services/firebase";
import {useTheme} from "../context/ThemeContext";

export default function QRScannerScreen() {
    const { t } = useTranslation('scanner');
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation<any>();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        if (scanned || processing) return;

        setScanned(true);
        setProcessing(true);

        try {
            // Sprawdź czy to nasz kod QR (format: exolog:animal:{animalId})
            if (data.startsWith('exolog:animal:')) {
                const animalId = data.replace('exolog:animal:', '');

                // Sprawdź czy zwierzę istnieje
                const result = await animalsService.getById(animalId);

                if (result.success && result.data) {
                    // Przenieś do szczegółów zwierzęcia
                    navigation.navigate('Animals', {
                        screen: 'AnimalDetails',
                        params: { animalId }
                    });
                } else {
                    Alert.alert(
                        t('qrScanner.notFoundTitle'),
                        t('qrScanner.notFoundMessage'),
                        [{ text: t('common:ok'), onPress: () => setScanned(false) }]
                    );
                }
            } else {
                Alert.alert(
                    t('qrScanner.unknownCodeTitle'),
                    t('qrScanner.unknownCodeMessage'),
                    [{ text: t('common:ok'), onPress: () => setScanned(false) }]
                );
            }
        } catch (error) {
            console.error('Error processing QR code:', error);
            Alert.alert(
                t('common:error'),
                t('qrScanner.errorMessage'),
                [{ text: t('common:ok'), onPress: () => setScanned(false) }]
            );
        } finally {
            setProcessing(false);
        }
    };

    if (!permission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text variant="headlineSmall" style={styles.title}>
                        {t('qrScanner.permissionTitle')}
                    </Text>
                    <Text variant="bodyMedium" style={styles.description}>
                        {t('qrScanner.permissionDescription')}
                    </Text>
                    <Button
                        mode="contained"
                        onPress={requestPermission}
                        style={styles.button}
                    >
                        {t('qrScanner.grantAccess')}
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            >
                <View style={styles.overlay}>
                    <View style={styles.header}>
                        <Text variant="titleLarge" style={styles.headerText}>
                            {t('qrScanner.title')}
                        </Text>
                        <Text variant="bodyMedium" style={styles.headerSubtext}>
                            {t('qrScanner.subtitle')}
                        </Text>
                    </View>

                    <View style={styles.scanArea}>
                        <View style={styles.cornerTL} />
                        <View style={styles.cornerTR} />
                        <View style={styles.cornerBL} />
                        <View style={styles.cornerBR} />
                    </View>

                    {processing && (
                        <View style={styles.processingContainer}>
                            <ActivityIndicator size="large" color="#fff" />
                            <Text style={styles.processingText}>{t('qrScanner.processing')}</Text>
                        </View>
                    )}

                    {scanned && !processing && (
                        <Button
                            mode="contained"
                            onPress={() => setScanned(false)}
                            style={styles.rescanButton}
                        >
                            {t('qrScanner.rescan')}
                        </Button>
                    )}
                </View>
            </CameraView>
        </View>
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        color: theme.colors.onSurface,
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        marginTop: 16,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginTop: 60,
    },
    headerText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    headerSubtext: {
        color: 'rgba(255,255,255,0.8)',
        marginTop: 8,
    },
    scanArea: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    cornerTL: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#fff',
        borderTopLeftRadius: 12,
    },
    cornerTR: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: '#fff',
        borderTopRightRadius: 12,
    },
    cornerBL: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#fff',
        borderBottomLeftRadius: 12,
    },
    cornerBR: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: '#fff',
        borderBottomRightRadius: 12,
    },
    processingContainer: {
        alignItems: 'center',
    },
    processingText: {
        color: '#fff',
        marginTop: 12,
    },
    rescanButton: {
        marginBottom: 40,
    },
});