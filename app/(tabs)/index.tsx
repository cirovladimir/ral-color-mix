import { useState, useEffect } from 'react';
import { FlatList, TextInput, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORANTS = [
  { name: 'Amarillo', code: 'AXX', color: '#FFF200' },
  { name: 'Negro', code: 'B', color: '#000000' },
  { name: 'Amarillo Oxido', code: 'C', color: '#FFD600' },
  { name: 'Verde', code: 'D', color: '#009640' },
  { name: 'Azul', code: 'E', color: '#009FE3' },
  { name: 'Rojo Oxido', code: 'F', color: '#E37222' },
  { name: 'Café Oxido', code: 'I', color: '#A98C66' },
  { name: 'Sombra', code: 'L', color: '#8C7B5A' },
  { name: 'Blanco', code: 'W', color: '#FFFFFF' },
  { name: 'Magenta', code: 'V', color: '#FF00A6' },
  { name: 'Amarillo Permanente', code: 'T', color: '#FFF200' },
  { name: 'Rojo Exterior', code: 'R', color: '#FF0000' },
];

export default function HomeScreen() {
  const [points, setPoints] = useState<{ [key: string]: { y: string; pts: string } }>({});
  const [costs, setCosts] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  // Load points from storage on mount
  useEffect(() => {
    AsyncStorage.getItem('colorantPoints').then(data => {
      if (data) setPoints(JSON.parse(data));
    });
    AsyncStorage.getItem('colorantCosts').then(data => {
      if (data) setCosts(JSON.parse(data));
    });
  }, []);

  // Save points to storage whenever they change
  useEffect(() => {
    AsyncStorage.setItem('colorantPoints', JSON.stringify(points));
  }, [points]);

  const renderItem = ({ item }: { item: typeof COLORANTS[0] }) => (
    <View style={styles.row}>
      <View style={[styles.colorBox, { backgroundColor: item.color }]}>
        <Text style={{
          color: item.code === 'W' ? '#000' : '#fff',
          fontWeight: 'bold',
        }}>
          {item.code}
        </Text>
      </View>
      <Text style={styles.name}>{item.name}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Y's"
        value={points[item.name]?.y || ''}
        onChangeText={text =>
          setPoints(prev => ({
            ...prev,
            [item.name]: { ...prev[item.name], y: text }
          }))
        }
      />
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Points"
        value={points[item.name]?.pts || ''}
        onChangeText={text =>
          setPoints(prev => ({
            ...prev,
            [item.name]: { ...prev[item.name], pts: text }
          }))
        }
      />
    </View>
  );

  const handleReport = () => {
    // Merge costs into points for each colorant
    const mergedPoints = Object.fromEntries(
      Object.entries(points).map(([name, values]) => [
        name,
        { ...values, cost: costs[name] || '' }
      ])
    );

    router.push({
      pathname: '/ral-report',
      params: { points: JSON.stringify(mergedPoints) }
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/ral-color-table.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Calculo Colorantes RAL</ThemedText>
      </ThemedView>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 0.7 }]}></Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Colorante</Text>
        <Text style={styles.headerCell}>Y's</Text>
        <Text style={styles.headerCell}>Puntos</Text>
      </View>
      <FlatList
        data={COLORANTS}
        keyExtractor={item => item.name}
        renderItem={renderItem}
        scrollEnabled={false}
      />
      <TouchableOpacity style={styles.button} onPress={handleReport}>
        <Text style={styles.buttonText}>Calcular</Text>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reactLogo: {
    height: 178,
    width: "100%",
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  colorBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    flex: 0.7,
  },
  name: {
    width: 120,
    flex: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 4,
    width: 60,
    marginLeft: 8,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 8,
  },
  headerCell: {
    fontWeight: 'bold',
    textAlign: 'center',
    width: 60,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    width: 220,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
