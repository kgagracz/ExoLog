import React from 'react';
import { Appbar, Menu, Divider } from 'react-native-paper';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface AnimalDetailsHeaderProps {
    animalName: string;
    menuVisible: boolean;
    onMenuToggle: (visible: boolean) => void;
    onGoBack: () => void;
    onEdit: () => void;
    onAddFeeding: () => void;
    onShowHistory: () => void;
    onDelete: () => void;
    onShowQR?: () => void;
    onMarkDeceased?: () => void;
    isOwner?: boolean;
}

const AnimalDetailsHeader: React.FC<AnimalDetailsHeaderProps> = ({
                                                                     animalName,
                                                                     menuVisible,
                                                                     onMenuToggle,
                                                                     onGoBack,
                                                                     onEdit,
                                                                     onAddFeeding,
                                                                     onShowHistory,
                                                                     onDelete,
                                                                     onShowQR,
                                                                     onMarkDeceased,
                                                                     isOwner = true
                                                                 }) => {
    const { t } = useAppTranslation('animals');

    return (
        <Appbar.Header>
            <Appbar.BackAction onPress={onGoBack} />
            <Appbar.Content title={animalName} />
            {onShowQR && (
                <Appbar.Action icon="qrcode" onPress={onShowQR} />
            )}
            {isOwner && (
                <Menu
                    visible={menuVisible}
                    onDismiss={() => onMenuToggle(false)}
                    anchor={
                        <Appbar.Action
                            icon="dots-vertical"
                            onPress={() => onMenuToggle(true)}
                        />
                    }
                >
                    <Menu.Item onPress={onEdit} title={t('common:edit')} leadingIcon="pencil" />
                    <Menu.Item onPress={onAddFeeding} title={t('details.fabFeeding')} leadingIcon="food-apple" />
                    <Menu.Item onPress={onShowHistory} title="Historia karmienia" leadingIcon="history" />
                    {onShowQR && (
                        <>
                            <Divider />
                            <Menu.Item onPress={() => { onMenuToggle(false); onShowQR(); }} title="Pokaż kod QR" leadingIcon="qrcode" />
                        </>
                    )}
                    <Divider />
                    {onMarkDeceased && (
                        <Menu.Item
                            onPress={() => { onMenuToggle(false); onMarkDeceased(); }}
                            title={t('details.deceasedTitle')}
                            leadingIcon="skull"
                            titleStyle={{ color: '#666' }}
                        />
                    )}
                    <Menu.Item
                        onPress={onDelete}
                        title={t('details.deleteTitle')}
                        leadingIcon="delete"
                        titleStyle={{ color: '#d32f2f' }}
                    />
                </Menu>
            )}
        </Appbar.Header>
    );
};

export default AnimalDetailsHeader;