import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { productService, shopService } from '../../services/api';
import { Home, ShoppingBag, Store, Search } from 'lucide-react-native';

const COLORS = {
  primary: '#0A0A0A',
  accent: '#FFD700',
  text: '#FAFAFA',
  textSecondary: '#9CA3AF',
  cardBg: '#1A1A1A',
};

export default function HomeScreen({ navigation }) {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.index().then(res => res.data.data),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>NexusLab</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Search size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={
          <View style={styles.categories}>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryText}>Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryText}>Productos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={styles.categoryText}>Servicios</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('Product', { productId: item.id })}
          >
            <View style={styles.productImage}>
              <Text style={styles.emoji}>📦</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price?.toLocaleString()}</Text>
              <Text style={styles.productShop}>{item.shop?.name || 'Tienda'}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay productos disponibles</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: COLORS.text,
    fontSize: 14,
  },
  grid: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    overflow: 'hidden',
    width: 300,

  },
  productImage: {
    height: 120,
    backgroundColor: '#2D2D2D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  productPrice: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  productShop: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});