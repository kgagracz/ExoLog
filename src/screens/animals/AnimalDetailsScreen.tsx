import React, {useEffect, useRef, useState} from 'react';
import {Alert, Animated, Dimensions, ScrollView, StyleSheet, View} from 'react-native';
import {FAB, Text} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useAuth} from "../../hooks/useAuth";
import {useTheme} from "../../context/ThemeContext";
import AnimalDetailsHeader from "../../components/molecules/AnimalDetailsHeader";
import SectionCard from "../../components/atoms/SectionCard";
import AnimalHeader from "../../components/molecules/AnimalHeader";
import MeasurementsSection from "../../components/molecules/MeasurementsSection";
import FeedingSection from "../../components/molecules/FeedingSection";
import PhotosSection from "../../components/molecules/PhotoSection";
import QRCodeModal from "../../components/organisms/QRCodeModal";
import {Theme} from "../../styles/theme";
import MoltingHistoryCard from "./MoltingHistoryScreen";
import { useAnimalQuery } from "../../api/animals";
import { useDeleteAnimalMutation, useMarkDeceasedMutation } from "../../api/animals";
import { useFeedingHistoryQuery } from "../../api/feeding";
import { useMoltingHistoryQuery, useMatingHistoryQuery, useCocoonHistoryQuery } from "../../api/events";
import { useTranslation } from 'react-i18next';

const HERO_HEIGHT = 280;
const SCREEN_WIDTH = Dimensions.get('window').width;

function SkeletonBlock({ width, height, style, theme }: { width: number | string; height: number; style?: any; theme: Theme }) {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    backgroundColor: theme.colors.surfaceLight,
                    borderRadius: theme.borderRadius.medium,
                    opacity,
                },
                style,
            ]}
        />
    );
}

function SkeletonCard({ theme }: { theme: Theme }) {
    const skeletonStyles = makeSkeletonStyles(theme);
    return (
        <View style={skeletonStyles.card}>
            <View style={skeletonStyles.cardHeader}>
                <SkeletonBlock width={20} height={20} theme={theme} style={{ borderRadius: 10 }} />
                <SkeletonBlock width={120} height={16} theme={theme} style={{ marginLeft: theme.spacing.small }} />
            </View>
            <View style={skeletonStyles.cardContent}>
                <SkeletonBlock width="100%" height={14} theme={theme} />
                <SkeletonBlock width="70%" height={14} theme={theme} style={{ marginTop: theme.spacing.small }} />
            </View>
        </View>
    );
}

function AnimalDetailsSkeleton({ theme }: { theme: Theme }) {
    const skeletonStyles = makeSkeletonStyles(theme);
    return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Hero skeleton */}
            <SkeletonBlock
                width={SCREEN_WIDTH}
                height={HERO_HEIGHT}
                theme={theme}
                style={{ borderRadius: 0, backgroundColor: theme.colors.onSurfaceVariant }}
            />

            {/* Section cards skeleton */}
            <SkeletonCard theme={theme} />
            <SkeletonCard theme={theme} />
            <SkeletonCard theme={theme} />
        </ScrollView>
    );
}

const makeSkeletonStyles = (theme: Theme) => StyleSheet.create({
    card: {
        margin: theme.spacing.medium,
        marginBottom: theme.spacing.small,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.large,
        padding: theme.spacing.medium,
        ...theme.shadows.small,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.ms,
    },
    cardContent: {
        gap: theme.spacing.small,
    },
});

export default function AnimalDetailsScreen() {
    const { t } = useTranslation('animals');
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { animalId } = route.params;

    const { user } = useAuth();
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const { data: animal, isLoading: loading } = useAnimalQuery(animalId);
    const { data: feedingHistory = [] } = useFeedingHistoryQuery(animalId);
    const { data: moltingHistory = [] } = useMoltingHistoryQuery(animalId, 5);
    const { data: matingHistoryData = [] } = useMatingHistoryQuery(animal?.sex === 'female' ? animalId : undefined);
    const { data: cocoonHistoryData = [] } = useCocoonHistoryQuery(animal?.sex === 'female' ? animalId : undefined);
    const deleteAnimalMutation = useDeleteAnimalMutation();
    const markDeceasedMutation = useMarkDeceasedMutation();

    const [menuVisible, setMenuVisible] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);
    const [qrModalVisible, setQrModalVisible] = useState(false);

    const matingStatus = matingHistoryData.length > 0
        ? {
            hasMating: true,
            lastMatingDate: matingHistoryData[0].date,
            lastMatingResult: matingHistoryData[0].eventData?.result,
        }
        : undefined;

    const cocoonStatus = (() => {
        if (cocoonHistoryData.length > 0) {
            const lastCocoon = cocoonHistoryData[0];
            if (lastCocoon.eventData?.cocoonStatus === 'laid' || lastCocoon.eventData?.cocoonStatus === 'incubating') {
                return {
                    hasCocoon: true,
                    lastCocoonDate: lastCocoon.date,
                    cocoonStatus: lastCocoon.eventData?.cocoonStatus,
                    estimatedHatchDate: lastCocoon.eventData?.estimatedHatchDate,
                };
            }
        }
        return undefined;
    })();

    const handleDelete = () => {
        Alert.alert(
            t('details.deleteTitle'),
            t('details.deleteMessage', { name: animal?.name }),
            [
                { text: t('common:cancel'), style: 'cancel' },
                {
                    text: t('common:delete'),
                    style: 'destructive',
                    onPress: async () => {
                        await deleteAnimalMutation.mutateAsync(animalId);
                        navigation.navigate('AnimalsList');
                    }
                }
            ]
        );
    };

    const handleMarkDeceased = () => {
        Alert.alert(
            t('details.deceasedTitle'),
            t('details.deceasedMessage', { name: animal?.name }),
            [
                { text: t('common:cancel'), style: 'cancel' },
                {
                    text: t('details.markDeceased'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await markDeceasedMutation.mutateAsync({ animalId });
                            Alert.alert(
                                t('details.deceasedSaved'),
                                t('details.deceasedSavedMessage', { name: animal?.name }),
                                [{ text: 'OK', onPress: () => navigation.navigate('AnimalsList') }]
                            );
                        } catch (err: any) {
                            Alert.alert(t('common:error'), err.message || t('details.deceasedError'));
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = () => {
        setMenuVisible(false);
        navigation.navigate('EditAnimal', { animalId });
    };

    const handleAddFeeding = () => {
        setMenuVisible(false);
        setFabOpen(false);
        navigation.navigate('AddFeeding', { preSelectedAnimal: animalId });
    };

    const handleAddMolting = () => {
        setFabOpen(false);
        navigation.navigate('AddMolting', { animalId });
    };

    const handleAddMating = () => {
        setFabOpen(false);
        if (animal?.sex === 'unknown') {
            Alert.alert(
                t('details.unknownSexTitle'),
                t('details.unknownSexMessage')
            );
            return;
        }
        navigation.navigate('AddMating', { animalId });
    };

    const handleAddCocoon = () => {
        setFabOpen(false);
        if (animal?.sex !== 'female') {
            Alert.alert(
                t('details.onlyFemalesTitle'),
                t('details.onlyFemalesMessage')
            );
            return;
        }
        navigation.navigate('AddCocoon', { animalId });
    };

    const handlePhotos = () => {
        setFabOpen(false);
        navigation.navigate('AnimalPhotos', {
            animalId,
            animalName: animal?.name || t('details.animalFallback')
        });
    };

    const handleFeedingHistory = () => {
        setMenuVisible(false);
        navigation.navigate('FeedingHistory', { animalId });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <AnimalDetailsHeader
                    animalName={t('details.title')}
                    menuVisible={false}
                    onMenuToggle={() => {}}
                    onGoBack={() => navigation.goBack()}
                    onEdit={() => {}}
                    onAddFeeding={() => {}}
                    onShowHistory={() => {}}
                    onDelete={() => {}}
                />
                <AnimalDetailsSkeleton theme={theme} />
            </View>
        );
    }

    const isOwner = !!user && animal?.userId === user.uid;

    if (!animal) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <AnimalDetailsHeader
                    animalName={t('details.title')}
                    menuVisible={false}
                    onMenuToggle={() => {}}
                    onGoBack={() => navigation.goBack()}
                    onEdit={() => {}}
                    onAddFeeding={() => {}}
                    onShowHistory={() => {}}
                    onDelete={() => {}}
                />
                <Text>{t('details.notFound')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AnimalDetailsHeader
                animalName={animal.name}
                menuVisible={menuVisible}
                onMenuToggle={setMenuVisible}
                onGoBack={() => navigation.goBack()}
                onEdit={handleEdit}
                onAddFeeding={handleAddFeeding}
                onShowHistory={handleFeedingHistory}
                onDelete={handleDelete}
                onShowQR={isOwner ? () => setQrModalVisible(true) : undefined}
                onMarkDeceased={handleMarkDeceased}
                isOwner={isOwner}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero ze zdjęciem głównym */}
                <AnimalHeader
                    animal={animal}
                    matingStatus={matingStatus}
                    cocoonStatus={cocoonStatus}
                    lastMoltDate={moltingHistory[0]?.date}
                />

                {/* Pomiary i wiek */}
                <SectionCard title={t('details.measurements')} icon="ruler">
                    <MeasurementsSection animal={animal} />
                </SectionCard>

                {/* Karmienie */}
                <SectionCard
                    title={t('details.feeding')}
                    icon="bug"
                    rightAction={{
                        icon: 'history',
                        onPress: handleFeedingHistory
                    }}
                >
                    <FeedingSection
                        animal={animal}
                        feedingHistory={feedingHistory}
                        onShowHistory={handleFeedingHistory}
                    />
                </SectionCard>

                {/* Historia wyliniek */}
                <SectionCard
                    title={t('details.moltingHistory')}
                    icon="sync"
                    rightAction={isOwner ? {
                        icon: 'plus',
                        onPress: () => navigation.navigate('AddMolting', { animalId })
                    } : undefined}
                >
                    {moltingHistory.length > 0 ? (
                        moltingHistory.map((molting) => (
                            <MoltingHistoryCard
                                key={molting.id}
                                molting={molting}
                            />
                        ))
                    ) : (
                        <Text variant="bodyMedium" style={styles.emptyText}>
                            {t('details.noMoltingHistory')}
                        </Text>
                    )}
                </SectionCard>

                {/*/!* Zachowanie *!/*/}
                {/*{animal.specificData && (*/}
                {/*    <SectionCard title="Zachowanie" icon="🧠">*/}
                {/*        <BehaviorSection animal={animal} />*/}
                {/*    </SectionCard>*/}
                {/*)}*/}

                {/* Notatki */}
                {animal.notes && (
                    <SectionCard title={t('common:notes')} icon="note-text-outline">
                        <Text variant="bodyMedium" style={styles.notesText}>
                            {animal.notes}
                        </Text>
                    </SectionCard>
                )}

                {/* Zdjęcia */}
                {user && (
                    <PhotosSection
                        userId={animal.userId}
                        animalId={animalId}
                        editable={isOwner}
                        maxDisplay={4}
                        onSeeAll={isOwner ? handlePhotos : undefined}
                    />
                )}

                {/*/!* Status zdrowia *!/*/}
                {/*<SectionCard>*/}
                {/*    <HealthStatusSection animal={animal} />*/}
                {/*</SectionCard>*/}

                {/* Spacer dla FAB */}
                <View style={styles.fabSpacer} />
            </ScrollView>

            {/* FAB do dodawania wydarzeń — tylko dla właściciela */}
            <FAB.Group
                open={fabOpen}
                visible={isOwner}
                icon={fabOpen ? 'close' : 'plus'}
                actions={[
                    {
                        icon: 'food-apple',
                        label: t('details.fabFeeding'),
                        onPress: handleAddFeeding,
                        color: theme.colors.events.feeding.color,
                        style: { backgroundColor: theme.colors.events.feeding.background },
                    },
                    {
                        icon: 'sync',
                        label: t('details.fabMolting'),
                        onPress: handleAddMolting,
                        color: theme.colors.events.molting.color,
                        style: { backgroundColor: theme.colors.events.molting.background },
                    },
                    {
                        icon: 'heart',
                        label: t('details.fabMating'),
                        onPress: handleAddMating,
                        color: theme.colors.events.mating.color,
                        style: { backgroundColor: theme.colors.events.mating.background },
                    },
                    {
                        icon: 'egg',
                        label: t('details.fabCocoon'),
                        onPress: handleAddCocoon,
                        color: theme.colors.events.cocoon.color,
                        style: { backgroundColor: theme.colors.events.cocoon.background },
                    },
                    {
                        icon: 'camera',
                        label: t('details.fabPhoto'),
                        onPress: handlePhotos,
                        color: theme.colors.events.photo.color,
                        style: { backgroundColor: theme.colors.events.photo.background },
                    },
                ]}
                onStateChange={({ open }) => setFabOpen(open)}
                fabStyle={styles.fab}
                style={styles.fabGroup}
            />

            {/* Modal z kodem QR */}
            <QRCodeModal
                visible={qrModalVisible}
                onClose={() => setQrModalVisible(false)}
                animal={animal}
            />
        </View>
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundSecondary,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    notesText: {
        lineHeight: 20,
        color: theme.colors.onSurfaceVariant,
    },
    emptyText: {
        color: theme.colors.onSurfaceVariant,
        fontStyle: 'italic',
    },
    fabSpacer: {
        height: 80,
    },
    fabGroup: {
        paddingBottom: 8,
    },
    fab: {
        backgroundColor: theme.colors.primary,
    },
});