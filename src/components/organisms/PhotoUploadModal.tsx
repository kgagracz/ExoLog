import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Button, IconButton } from 'react-native-paper';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useTheme } from '../../context/ThemeContext';
import FormInput from '../atoms/FormInput';
import FormNumberInput from '../atoms/FormNumberInput';
import { Theme } from '../../styles/theme';

export interface PhotoUploadData {
    description: string;
    bodyLength: number | null;
    stage: number | null;
}

interface PhotoUploadModalProps {
    visible: boolean;
    imageUris: string[];
    initialBodyLength?: number | null;
    initialStage?: number | null;
    onConfirm: (data: PhotoUploadData) => void;
    onDismiss: () => void;
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
    visible,
    imageUris,
    initialBodyLength,
    initialStage,
    onConfirm,
    onDismiss,
}) => {
    const { theme } = useTheme();
    const { t } = useAppTranslation('forms');
    const insets = useSafeAreaInsets();
    const styles = makeStyles(theme);

    const [description, setDescription] = useState('');
    const [bodyLength, setBodyLength] = useState<number | null>(initialBodyLength ?? null);
    const [stage, setStage] = useState<number | null>(initialStage ?? null);

    useEffect(() => {
        if (visible) {
            setDescription('');
            setBodyLength(initialBodyLength ?? null);
            setStage(initialStage ?? null);
        }
    }, [visible, initialBodyLength, initialStage]);

    const handleConfirm = () => {
        onConfirm({ description, bodyLength, stage });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onDismiss}
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <IconButton icon="close" onPress={onDismiss} />
                    <Text variant="titleMedium" style={styles.headerTitle}>
                        {t('photoUpload.title')}
                    </Text>
                    <View style={{ width: 48 }} />
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Photo previews */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.previewContainer}
                    >
                        {imageUris.map((uri, index) => (
                            <Image
                                key={index}
                                source={{ uri }}
                                style={styles.preview}
                            />
                        ))}
                    </ScrollView>

                    {/* Description */}
                    <Card style={styles.section}>
                        <Card.Content>
                            <FormInput
                                label={t('photoUpload.descriptionLabel')}
                                value={description}
                                onChangeText={setDescription}
                                placeholder={t('photoUpload.descriptionPlaceholder')}
                                multiline
                                numberOfLines={3}
                            />
                        </Card.Content>
                    </Card>

                    {/* Measurements */}
                    <Card style={styles.section}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                {t('photoUpload.measurementsSection')}
                            </Text>
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    <FormNumberInput
                                        label={t('photoUpload.bodyLengthLabel')}
                                        value={bodyLength}
                                        onValueChange={setBodyLength}
                                        unit="cm"
                                        min={0}
                                        max={30}
                                        decimal
                                        placeholder={t('photoUpload.bodyLengthPlaceholder')}
                                    />
                                </View>
                                <View style={styles.halfWidth}>
                                    <FormNumberInput
                                        label={t('photoUpload.stageLabel')}
                                        value={stage}
                                        onValueChange={setStage}
                                        prefix="L"
                                        min={1}
                                        max={16}
                                        placeholder={t('photoUpload.stagePlaceholder')}
                                    />
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
                    <Button
                        mode="contained"
                        onPress={handleConfirm}
                        style={styles.submitButton}
                        icon="upload"
                    >
                        {t('photoUpload.submit')}
                    </Button>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: Platform.OS === 'ios' ? 50 : 8,
            paddingHorizontal: 4,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        headerTitle: {
            fontWeight: 'bold',
            color: theme.colors.textPrimary,
        },
        content: {
            flex: 1,
        },
        contentContainer: {
            padding: 16,
        },
        previewContainer: {
            gap: 8,
            paddingBottom: 16,
        },
        preview: {
            width: 100,
            height: 100,
            borderRadius: theme.borderRadius.medium,
        },
        section: {
            marginBottom: 16,
            backgroundColor: theme.colors.surface,
        },
        sectionTitle: {
            marginBottom: 16,
            fontWeight: 'bold',
            color: theme.colors.primary,
        },
        row: {
            flexDirection: 'row',
            gap: 12,
        },
        halfWidth: {
            flex: 1,
        },
        footer: {
            padding: 16,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        submitButton: {
            borderRadius: theme.borderRadius.medium,
        },
    });

export default PhotoUploadModal;
