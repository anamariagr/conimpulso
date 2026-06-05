import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../stores/AuthContext';
import { Wallet, ShoppingBag, MessageSquare, Bell } from 'lucide-react-native';

const COLORS = {
  primary: '#0A0A0A',
  accent: '#FFD700',
  text: '#FAFAFA',
  textSecondary: '#9CA3AF',
  cardBg: '#1A1A1A',
};

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {user?.name}</Text>
        <Text style={styles.subtitle}>Bienvenido a tu dashboard</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Wallet size={32} color={COLORS.accent} />
          <Text style={styles.cardTitle}>Billetera</Text>
          <Text style={styles.cardValue}>$0</Text>
        </View>

        <View style={styles.card}>
          <ShoppingBag size={32} color="#22C55E" />
          <Text style={styles.cardTitle}>Productos</Text>
          <Text style={styles.cardValue}>0</Text>
        </View>

        <View style={styles.card}>
          <MessageSquare size={32} color="#3B82F6" />
          <Text style={styles.cardTitle}>Mensajes</Text>
          <Text style={styles.cardValue}>0</Text>
        </View>

        <View style={styles.card}>
          <Bell size={32} color="#EF4444" />
          <Text style={styles.cardTitle}>Notificaciones</Text>
          <Text style={styles.cardValue}>0</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '47%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
  },
  cardTitle: {
    color: COLORS.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
  cardValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
});