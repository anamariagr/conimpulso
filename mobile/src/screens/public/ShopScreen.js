import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { shopService } from '../../services/api';

const COLORS = {
  primary: '#0A0A0A',
  accent: '#FFD700',
  text: '#FAFAFA',
  textSecondary: '#9CA3AF',
  cardBg: '#1A1A1A',
};

export default function ShopScreen({ route }) {
  const { slug } = route.params;

  const { data: shop, isLoading } = useQuery({
    queryKey: ['shop', slug],
    queryFn: () => shopService.show(slug).then(res => res.data.data),
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>🏪</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{shop?.name}</Text>
        <Text style={styles.location}>📍 {shop?.city || 'Ciudad no especificada'}</Text>

        {shop?.is_verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verificado</Text>
          </View>
        )}

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{shop?.followers || 0}</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{shop?.views || 0}</Text>
            <Text style={styles.statLabel}>Vistas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            {shop?.description || 'Esta tienda aún no tiene descripción.'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  loading: {
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 100,
  },
  banner: {
    height: 150,
    backgroundColor: '#2D2D2D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 64,
  },
  content: {
    padding: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  location: {
    color: COLORS.textSecondary,
    marginTop: 8,
    fontSize: 16,
  },
  verifiedBadge: {
    backgroundColor: '#22C55E20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  verifiedText: {
    color: '#22C55E',
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  statLabel: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
});