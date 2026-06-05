import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
  primary: '#0A0A0A',
  accent: '#FFD700',
  text: '#FAFAFA',
  textSecondary: '#9CA3AF',
};

export default function WalletScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Billetera</Text>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo disponible</Text>
        <Text style={styles.balanceValue}>$0</Text>
      </View>
      <Text style={styles.empty}>No hay transacciones aún</Text>
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
  balanceCard: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    color: '#0A0A0A80',
    fontSize: 14,
  },
  balanceValue: {
    color: '#0A0A0A',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 8,
  },
  empty: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 48,
  },
});