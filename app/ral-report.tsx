import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';

const BASE_LIST_PRICE = 298.31;
const BASE_COST = 298.31;

export default function RalReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [ralColorMixes, setRalColorMixes] = useState<{ [key: string]: { 
    name: string, 
    points: any,
    colorantTotal: number,
    totalBaseColorant: number,
    utilidad: number,
    total: number
  } }>({});
  const [points, setPoints] = useState<{ [key: string]: { y: string; pts: string; cost: string } }>({});

  // Modal state for saving
  const [modalVisible, setModalVisible] = useState(false);
  const [mixId, setMixId] = useState('');
  const [mixName, setMixName] = useState('');
  const [salePrice, setSalePrice] = useState<string>('1000.00'); // Default value
  const [editingMixInfo, setEditingMixInfo] = useState<{ id?: string; name?: string } | null>(null);

  // Load existing mixes on mount
  useEffect(() => {
    AsyncStorage.getItem('ralColorMixes').then(data => {
      if (data) setRalColorMixes(JSON.parse(data));
    });
  }, []);

  // Set salePrice from params only once
  useEffect(() => {
    if (params.mix) {
      const mix = JSON.parse(params.mix as string);
      setPoints(mix.points || {});
      setSalePrice(mix.salePrice ? (mix.salePrice * 1.16).toFixed(2) : '1000.00');
      if (mix.id && mix.name) {
        setEditingMixInfo({ id: mix.id, name: mix.name });
      } else {
        setEditingMixInfo(null);
      }
    } else {
      setEditingMixInfo(null);
    }
  }, [params.mix]);

  const getColorantTotal = () => {
    let total = 0;
    Object.values(points).forEach(({ y, pts, cost }) => {
      total += ((parseFloat(y || '0') * 48) + parseFloat(pts || '0')) * parseFloat(cost || '0') / 1536;
    });
    return total;
  };

  const colorantTotal = getColorantTotal();
  const totalBaseColorant = BASE_COST + colorantTotal;
  const salePriceNumber = parseFloat(salePrice || '0') / 1.16; // Remove IVA
  const salesPrice = salePriceNumber / 1.16; // IVA discount (business rule)
  const utilidad = (1 - (totalBaseColorant / salesPrice)) * 100;
  const total = salesPrice - totalBaseColorant;

  // Helper to format with IVA
  const withIVA = (value: number) => `$${(value * 1.16).toFixed(2)}`;

  // Save RAL mix handler
  const handleSaveMix = async () => {
    setModalVisible(true);
  };

  const handleConfirmSave = async () => {
    if (!mixId.trim() || !mixName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un ID y un nombre para el mix.');
      return;
    }
    const mix = {
      id: mixId.trim(),
      name: mixName.trim(),
      points,
      colorantTotal,
      totalBaseColorant,
      utilidad,
      total,
      salePrice: salePriceNumber,
      date: new Date().toISOString(),
    };
    // Load existing mixes
    const mixes = { ...ralColorMixes, [mixId.trim()]: mix };
    await AsyncStorage.setItem('ralColorMixes', JSON.stringify(mixes));
    setRalColorMixes(mixes);
    setModalVisible(false);
    setMixId('');
    setMixName('');
    Alert.alert('Éxito', 'RAL mix guardado.');
  };

  // Print handler (for now, just alert or implement sharing/printing as needed)
  const handlePrint = () => {
    alert('Función de impresión no implementada.');
    // You can integrate expo-print or expo-sharing here if needed
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 16 }}>
        Costo de Producción RAL
      </ThemedText>
      {editingMixInfo ? (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#0a7ea4' }}>
            Editando mix: {editingMixInfo.name} (ID: {editingMixInfo.id})
          </Text>
        </View>
      ) : (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#888' }}>
            Creando un nuevo mix RAL
          </Text>
        </View>
      )}
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Precio de Venta (con IVA):</Text>
        <TextInput
          style={styles.inputSalePrice}
          keyboardType="numeric"
          value={salePrice}
          onChangeText={setSalePrice}
          placeholder="Precio de Venta"
        />
      </View>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={styles.cellLabel}>Concepto</Text>
          <Text style={styles.cellValue}>Valor</Text>
          <Text style={styles.cellValue}>+IVA</Text>
        </View>
        <Row label="Costo Total Colorantes" value={`$${colorantTotal.toFixed(2)}`} iva={withIVA(colorantTotal)} />
        <Row label="Precio de Lista de Base" value={`$${BASE_LIST_PRICE.toFixed(2)}`} iva={withIVA(BASE_LIST_PRICE)} />
        <Row label="Descuento Semestral" value={''} iva={''} />
        <Row label="Costo de Base" value={`$${BASE_COST.toFixed(2)}`} iva={withIVA(BASE_COST)} />
        <Row label="TOTAL BASE  +  COLORANTE" value={`$${totalBaseColorant.toFixed(2)}`} iva={withIVA(totalBaseColorant)} />
        <Row label="Precio de Venta" value={`$${salePriceNumber.toFixed(2)}`} iva={withIVA(salePriceNumber)} />
        <Row label="PRECIO DE VENTAS" value={`$${salesPrice.toFixed(2)}`} iva={withIVA(salesPrice)} />
        <Row label="UTILIDAD EN %" value={`${utilidad.toFixed(0)}%`} iva={''} />
        <Row label="UTILIDAD TOTAL" value={`$${total.toFixed(2)}`} iva={withIVA(total)} />
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleSaveMix}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handlePrint}>
          <Text style={styles.buttonText}>Imprimir</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Guardar RAL Mix</Text>
            <TextInput
              placeholder="ID único"
              value={mixId}
              onChangeText={setMixId}
              style={styles.input}
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Nombre del mix"
              value={mixName}
              onChangeText={setMixName}
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', marginTop: 16, justifyContent: 'space-between' }}>
              <TouchableOpacity style={[styles.button, { flex: 1, marginRight: 8 }]} onPress={handleConfirmSave}>
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { flex: 1, backgroundColor: '#aaa', marginLeft: 8 }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Row({ label, value, iva }: { label: string; value: string; iva: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue}>{value}</Text>
      <Text style={styles.cellValue}>{iva}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  inputSalePrice: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    width: 120,
    backgroundColor: '#fff',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 32,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cellLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1.5,
  },
  cellValue: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: 160,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: '#aaa',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginVertical: 6,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
    width: 300,
    elevation: 5,
  },
});