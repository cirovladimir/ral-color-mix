import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import { useState } from 'react';
import { FlatList, TextInput, View, Text } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

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

export default function TabTwoScreen() {
  const [costs, setCosts] = useState<{ [key: string]: string }>({});

  const renderItem = ({ item }: { item: typeof COLORANTS[0] }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
      <View
        style={{
          width: 32,
          height: 32,
          backgroundColor: item.color,
          borderRadius: 6,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 8,
          borderWidth: 1,
          borderColor: '#ccc',
        }}
      >
        <Text style={{
          color: item.code === 'W' ? '#000' : '#fff',
          fontWeight: 'bold',
        }}>
          {item.code}
        </Text>
      </View>
      <Text style={{ width: 120 }}>{item.name}</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 4,
          padding: 4,
          width: 80,
          marginLeft: 8,
        }}
        keyboardType="numeric"
        placeholder="Costo"
        value={costs[item.name] || ''}
        onChangeText={text => setCosts(prev => ({ ...prev, [item.name]: text }))}
      />
    </View>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Image
          source={require('@/assets/images/osel-local-skew.png')}
          alt="Osel Mix Logo"
          style={styles.headerImage}
        />
      }>
      <ThemedText type="subtitle" style={{ marginTop: 16, marginBottom: 8 }}>
        Captura el precio de compra de los colorantes:
      </ThemedText>
      <FlatList
        data={COLORANTS}
        keyExtractor={item => item.name}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 200,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
