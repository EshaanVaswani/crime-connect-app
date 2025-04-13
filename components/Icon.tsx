import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function Icon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  color?: string;
}) {
  return <Ionicons {...props} />;
}