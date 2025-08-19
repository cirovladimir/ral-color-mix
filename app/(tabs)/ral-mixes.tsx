import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Image } from 'react-native';

export default function RalMixesScreen() {
  const [mixes, setMixes] = useState<any[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('ralColorMixes').then(data => {
      if (data) setMixes(JSON.parse(data));
    });
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.mixRow}>
      <Text style={styles.mixName}>{item.name || 'Sin nombre'}</Text>
      <Text style={styles.mixDetails}>{JSON.stringify(item.details)}</Text>
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
      <FlatList
        data={mixes}
        keyExtractor={(_, idx) => idx.toString()}
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
  mixRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  mixName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  mixDetails: {
    color: '#555',
    marginTop: 4,
  },
  reactLogo: {
    width: "100%",
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});