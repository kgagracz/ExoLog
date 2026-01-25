import React from 'react';
import { View, StyleSheet, Modal, Share, Image } from 'react-native';
import { Text, Button, IconButton, Surface } from 'react-native-paper';
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../styles/theme";
import { Animal } from "../../types";

interface QRCodeModalProps {
    visible: boolean;
    onClose: () => void;
    animal: Animal;
}

export default function QRCodeModal({ visible, onClose, animal }: QRCodeModalProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    // Format kodu QR: exolog:animal:{animalId}
    const qrValue = `exolog:animal:${animal.id}`;

    // Używamy publicznego API do generowania QR
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}`;

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Kod QR dla ${animal.name || animal.species}\n\nID: ${animal.id}\n\nLink do kodu: ${qrImageUrl}`,
                title: `ExoLog - ${animal.name || animal.species}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Surface style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text variant="titleLarge" style={styles.title}>
                            Kod QR
                        </Text>
                        <IconButton
                            icon="close"
                            size={24}
                            onPress={onClose}
                        />
                    </View>

                    <View style={styles.content}>
                        <View style={styles.qrContainer}>
                            <Image
                                source={{ uri: qrImageUrl }}
                                style={styles.qrImage}
                                resizeMode="contain"
                            />
                        </View>

                        <Text variant="titleMedium" style={styles.animalName}>
                            {animal.name || 'Bez nazwy'}
                        </Text>
                        <Text variant="bodyMedium" style={styles.species}>
                            {animal.species}
                        </Text>

                        <Text variant="bodySmall" style={styles.hint}>
                            Wydrukuj i naklej na terrarium, aby szybko skanować
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        <Button
                            mode="outlined"
                            onPress={handleShare}
                            icon="share-variant"
                            style={styles.actionButton}
                        >
                            Udostępnij
                        </Button>
                        <Button
                            mode="contained"
                            onPress={onClose}
                            style={styles.actionButton}
                        >
                            Zamknij
                        </Button>
                    </View>
                </Surface>
            </View>
        </Modal>
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 16,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 0,
    },
    title: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },
    content: {
        alignItems: 'center',
        padding: 24,
    },
    qrContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
    },
    qrImage: {
        width: 200,
        height: 200,
    },
    animalName: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginTop: 8,
    },
    species: {
        color: theme.colors.primary,
        fontStyle: 'italic',
        marginTop: 4,
    },
    hint: {
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
        marginTop: 16,
    },
    actions: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.divider,
    },
    actionButton: {
        flex: 1,
    },
});