import React from 'react';
import { Appbar, Menu, Divider } from 'react-native-paper';

interface AnimalDetailsHeaderProps {
    animalName: string;
    menuVisible: boolean;
    onMenuToggle: (visible: boolean) => void;
    onGoBack: () => void;
    onEdit: () => void;
    onAddFeeding: () => void;
    onShowHistory: () => void;
    onDelete: () => void;
}

const AnimalDetailsHeader: React.FC<AnimalDetailsHeaderProps> = ({
                                                                     animalName,
                                                                     menuVisible,
                                                                     onMenuToggle,
                                                                     onGoBack,
                                                                     onEdit,
                                                                     onAddFeeding,
                                                                     onShowHistory,
                                                                     onDelete
                                                                 }) => {
    return (
        <Appbar.Header>
            <Appbar.BackAction onPress={onGoBack} />
            <Appbar.Content title={animalName} />
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
                <Menu.Item onPress={onEdit} title="Edytuj" leadingIcon="pencil" />
                <Menu.Item onPress={onAddFeeding} title="Dodaj karmienie" leadingIcon="food-apple" />
                <Menu.Item onPress={onShowHistory} title="Historia karmienia" leadingIcon="history" />
                <Divider />
                <Menu.Item
                    onPress={onDelete}
                    title="Usuń zwierzę"
                    leadingIcon="delete"
                    titleStyle={{ color: '#d32f2f' }}
                />
            </Menu>
        </Appbar.Header>
    );
};

export default AnimalDetailsHeader;