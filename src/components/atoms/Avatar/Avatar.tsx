import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import Text from '../Text/Text';
import {Theme} from "../../../styles/theme";

type AvatarSize = 'small' | 'medium' | 'large' | 'xl';

interface AvatarProps {
  emoji?: string;
  size?: AvatarSize;
  backgroundColor?: string;
  borderColor?: string;
  style?: any;
}

const Avatar: React.FC<AvatarProps> = ({
  emoji = '🕷️',
  size = 'medium',
  backgroundColor,
  borderColor,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme, size);

  return (
    <View
      style={[
        styles.container,
        backgroundColor && { backgroundColor },
        borderColor && { borderColor },
        style,
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
};

const createStyles = (theme: Theme, size: AvatarSize) => {
  const avatarSize = theme.sizes.avatar[size];
  const emojiSize = size === 'xl' ? 32 : size === 'large' ? 24 : size === 'medium' ? 20 : 16;

  return StyleSheet.create({
    container: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: theme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary + '30',
    },
    emoji: {
      fontSize: emojiSize,
      lineHeight: emojiSize + 4,
    },
  });
};

export default Avatar;
