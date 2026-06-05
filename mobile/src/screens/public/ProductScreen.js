import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/api';

const COLORS = {
  primary: '#0A0A0A',
  accent: '#FFD700',
  text: '#FAFAFA',
  textSecondary: '#9CA3AF',
  cardBg: '#1A1A1A',
};

export default function ProductScreen({ route }) {
  const { productId } = route.params;

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productService.show(productId).then(res => res.data.data),
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
      <View style={styles.imageContainer}>
        <Text style={styles.emoji}>📦</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{product?.name}</Text>
        <Text style={styles.price}>${product?.price?.toLocaleString()}</Text>
        <Text style={styles.shop}>{product?.shop?.name}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            {product?.description || 'Sin descripción disponible'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stock:</Text>
            <Text style={styles.infoValue}>{product?.stock || 0}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SKU:</Text>
            <Text style={styles.infoValue}>{product?.sku || 'N/A'}</Text>
          </View>
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
  imageContainer: {
    height: 300,
    backgroundColor: '#2D2D2D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 100,
  },
  content: {
    padding: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginTop: 8,
  },
  shop: {
    fontSize: 16,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  infoLabel: {
    color: COLORS.textSecondary,
  },
  infoValue: {
    color: COLORS.text,
    fontWeight: '500',
  },
});