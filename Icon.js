import React from 'react';
import { Text } from 'react-native';

// Custom Icon Component - Emoji ve text-based icons
export const Icon = ({ name, size = 24, color = '#000' }) => {
  const icons = {
    // Navigation
    home: '🏠',
    'swap-horizontal': '⇄',
    'bar-chart': '📊',
    settings: '⚙️',
    
    // Transaction
    add: '➕',
    trash: '🗑️',
    calendar: '📅',
    'chevron-back': '◀️',
    'chevron-forward': '▶️',
    close: '✕',
    
    // Analytics
    analytics: '📈',
    'trending-up': '📈',
    'trending-down': '📉',
    percent: '%',
    'information-circle': 'ℹ️',
    inbox: '📭',
    'add-circle': '⊕',
    layers: '🔤',
    cube: '📦',
    'checkmark-circle': '✓',
    
    // Settings
    globe: '🌐',
    cash: '💵',
    notifications: '🔔',
    'cloud-download': '☁️⬇️',
    refresh: '🔄',
    'help-circle': '❓',
    'document-text': '📄',
    download: '⬇️',
    upload: '⬆️',
  };

  const emoji = icons[name] || '•';

  return (
    <Text style={{ fontSize: size, color, marginRight: 0 }}>
      {emoji}
    </Text>
  );
};

// Alternative simpler text-based icon if needed
export const TextIcon = ({ name, size = 24, color = '#000' }) => {
  const simpleIcons = {
    home: 'HOME',
    transaction: 'TRANS',
    analytics: 'STAT',
    settings: 'SET',
    add: '+',
    delete: 'DEL',
    back: '<',
    close: 'X',
  };

  return (
    <Text style={{
      fontSize: size * 0.5,
      color,
      fontWeight: 'bold',
      textAlign: 'center'
    }}>
      {simpleIcons[name] || name}
    </Text>
  );
};
