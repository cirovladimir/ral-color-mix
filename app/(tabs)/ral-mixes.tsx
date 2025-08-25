import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RalMixesScreen() {
  const [mixes, setMixes] = useState<{ [key: string]: { 
    name: string, 
    points: any,
    colorantTotal: number,
    totalBaseColorant: number,
    utilidad: number,
    total: number,
    salePrice: number
  } }>({});
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('ralColorMixes').then(data => {
        if (data) setMixes(JSON.parse(data));
        else setMixes({});
      });
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.tableRow}>
      <View style={styles.tableCellLeft}>
        <Text style={styles.mixId}>{item.key}</Text>
        <Text style={styles.mixName}>{item.name}</Text>
      </View>
      <View style={styles.tableCellRight}>
        <TouchableOpacity
          style={styles.loadButton}
          onPress={() =>
            router.push({
              pathname: '/ral-report',
              params: {
                mix: JSON.stringify(item),
              },
            })
          }
        >
          <Text style={styles.buttonText}>Cargar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E0E0E0', dark: '#222' }}
      headerImage={
      <Image
        source={require('@/assets/images/ral-color-table.png')}
        style={styles.reactLogo}
      />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">RAL Color Mixes</ThemedText>
      </ThemedView>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, { flex: 2 }]}>ID y Nombre</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>Acción</Text>
      </View>
    <FlatList
      data={Object.entries(mixes).map(([key, value]) => ({ key, ...value }))}
      keyExtractor={item => item.key}
      renderItem={renderItem}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 32 }}>
          No RAL mixes saved yet.
        </Text>
      }
    />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tableCellLeft: {
    flex: 2,
    flexDirection: 'column',
  },
  tableCellRight: {
    flex: 1,
    alignItems: 'center',
  },
  mixId: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  mixName: {
    color: '#555',
    fontSize: 14,
    marginTop: 2,
  },
  loadButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  reactLogo: {
    width: "100%",
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});