import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';

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

const BASE_LIST_PRICE_DEFAULT = 298.31;
const BASE_COST_DEFAULT = 298.31;

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
  const [baseListPrice, setBaseListPrice] = useState<string>(BASE_LIST_PRICE_DEFAULT.toString());

  // Load existing mixes on mount
  useEffect(() => {
    AsyncStorage.getItem('ralColorMixes').then(data => {
      if (data) setRalColorMixes(JSON.parse(data));
    });
  }, []);

  // Set salePrice, points, and editing info from params.mix if present
  useEffect(() => {
    if (params.mix) {
      const mix = JSON.parse(params.mix as string);
      setPoints(mix.points || {});
      setSalePrice(mix.salePrice ? (mix.salePrice * 1.16).toFixed(2) : '1000.00');
      setBaseListPrice(mix.baselistPrice ? mix.baselistPrice.toString() : BASE_LIST_PRICE_DEFAULT.toString());
      if (mix.id && mix.name) {
        setEditingMixInfo({ id: mix.id, name: mix.name });
        setMixId(mix.id);      // Pre-populate ID
        setMixName(mix.name);  // Pre-populate Name
      } else {
        setEditingMixInfo(null);
        setMixId('');
        setMixName('');
      }
    } else {
      setEditingMixInfo(null);
      setMixId('');
      setMixName('');
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
  const baseListPriceNumber = parseFloat(baseListPrice || '0');
  const baseCostNumber = parseFloat(baseListPrice || '0');
  const totalBaseColorant = baseListPriceNumber + colorantTotal;
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
      baselistPrice: baseListPriceNumber,
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
  const handlePrint = async () => {
    // Generate colorant table rows with colored rectangles and codes
    const colorantRows =  COLORANTS.map(colorant => {
          const { name, code, color } = colorant;
          const y = points[name]?.y || '0';
          const pts = points[name]?.pts || '0';
          return `
            <tr>
              <td class="color-cell">
                <span class="color-box" style="background:${color || '#fff'}"></span>
                <span style="font-weight:bold;">${code || ''}</span>
                <span style="margin-left:6px;">${name}</span>
              </td>
              <td style="text-align:right;">${y}</td>
              <td style="text-align:right;">${pts}</td>
            </tr>
          `;
        }).join('');

    const printContent = `
      <style>
        @page {
          size: Letter;
          margin: 0.5in;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 13px;
          margin: 2em;
          padding: 0;
          width: 100%;
          box-sizing: border-box;
        }
        h1, h2 {
          margin: 0.5em 0 0.3em 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        table.colorants {
          width: 50%;
          border-collapse: collapse;
          font-size: 9px;
        }
        th, td {
          padding: 6px;
          border: 1px solid #ddd;
        }
        .color-cell {
          display: flex;
          align-items: center;
          padding: 4px;
        }
        .color-box {
          display: inline-block;
          width: 14px;
          height: 14px;
          border-radius: 3px;
          border: 1px solid #ccc;
          margin-right: 5px;
          vertical-align: middle;
        }
      </style>
      <h1>Reporte de Costo de Producción RAL</h1>
      <p><strong>Mix:</strong> ${editingMixInfo?.name} (ID: ${editingMixInfo?.id})</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
      <h3>Tabla de Colorantes</h3>
      <table class="colorants">
        <tr style="background-color:#f2f2f2; font-weight:bold;">
          <th>Colorante</th>
          <th>Y's</th>
          <th>Puntos</th>
        </tr>
        ${colorantRows}
      </table>
      <h2>Detalles del Costo</h2>
      <table style="width:100%; border-collapse:collapse;">
        <tr style="background-color:#f2f2f2; font-weight:bold;">
          <th style="border:1px solid #ddd; padding:8px;">Concepto</th>
          <th style="border:1px solid #ddd; padding:8px;">Valor</th>
          <th style="border:1px solid #ddd; padding:8px;">+IVA</th>
        </tr>
        <tr style="background-color:#fff;">
          <td style="border:1px solid #ddd; padding:8px;">Costo Total Colorantes</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">$${colorantTotal.toFixed(2)}</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">${withIVA(colorantTotal)}</td>
        </tr>
        <tr style="background-color:#fff;">
          <td style="border:1px solid #ddd; padding:8px;">Precio de Lista de Base</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">$${baseListPriceNumber.toFixed(2)}</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">${withIVA(baseListPriceNumber)}</td>
        </tr>
        <tr style="background-color:#fff;">
          <td style="border:1px solid #ddd; padding:8px;">Descuento Semestral</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">$0.00</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">$0.00</td>
        </tr>
        <tr style="background-color:#fff;">
          <td style="border:1px solid #ddd; padding:8px;">Costo de Base</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">$${baseCostNumber.toFixed(2)}</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">${withIVA(baseCostNumber)}</td>
        </tr>
        <tr style="background-color:#fff;">
          <td style="border:1px solid #ddd; padding:8px;">TOTAL BASE  +  COLORANTE</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">$${totalBaseColorant.toFixed(2)}</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">${withIVA(totalBaseColorant)}</td>
        </tr>
        <tr style="background-color:#fff;">
          <td style="border:1px solid #ddd; padding:8px;">Precio de Venta</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">$${salePriceNumber.toFixed(2)}</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">${withIVA(salePriceNumber)}</td>
        </tr>
        <tr style="background-color:#fff;">
          <td style="border:1px solid #ddd; padding:8px;">PRECIO DE VENTAS</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">$${salesPrice.toFixed(2)}</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">${withIVA(salesPrice)}</td>
        </tr>
        <tr style="background-color:#fff;">
          <td style="border:1px solid #ddd; padding:8px;">UTILIDAD EN %</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">${utilidad.toFixed(0)}%</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">$${total.toFixed(2)}</td>
        </tr>
      </table>
      <p style="margin-top:20px; font-weight:bold;">Gracias por su preferencia.</p>
    `;
    await Print.printAsync({
      html: printContent,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 16 }}>
        Costo de Producción RAL
      </ThemedText>
      {editingMixInfo ? (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#0a7ea4' }}>
            {editingMixInfo.name} (ID: {editingMixInfo.id})
          </Text>
        </View>
      ) : (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#888' }}>
            Nuevo mix RAL
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
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Precio de Lista de Base:</Text>
        <TextInput
          style={styles.inputSalePrice}
          keyboardType="numeric"
          value={baseListPrice}
          onChangeText={setBaseListPrice}
          placeholder="Precio de Lista de Base"
        />
      </View>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={styles.cellLabel}>Concepto</Text>
          <Text style={styles.cellValue}>Valor</Text>
          <Text style={styles.cellValue}>+IVA</Text>
        </View>
        <Row label="Costo Total Colorantes" value={`$${colorantTotal.toFixed(2)}`} iva={withIVA(colorantTotal)} />
        <Row label="Precio de Lista de Base" value={`$${baseListPriceNumber.toFixed(2)}`} iva={withIVA(baseListPriceNumber)} />
        <Row label="Descuento Semestral" value={''} iva={''} />
        <Row label="Costo de Base" value={`$${baseCostNumber.toFixed(2)}`} iva={withIVA(baseCostNumber)} />
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
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
              Guardar RAL Mix
            </Text>
            <TextInput
              placeholder="ID único"
              value={mixId}
              onChangeText={setMixId}
              style={[styles.input, editingMixInfo?.id ? { backgroundColor: '#eee', color: '#888' } : {}]}
              autoCapitalize="none"
              editable={!editingMixInfo?.id} // Disable if editing existing mix
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