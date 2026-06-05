import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
  primary: '#0A0A0A',
  text: '#FAFAFA',
  textSecondary: '#9CA3AF',
};

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar</Text>
      <Text style={styles.empty}>Busca productos, tiendas o servicios</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
  empty: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 48,
  },
});