import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// Update the import path below to the correct relative path if needed
import { ThemedText } from '../components/ThemedText';

const BASE_LIST_PRICE = 298.31;
const BASE_COST = 298.31;
const SALE_PRICE = 1100.0;
const SALES_PRICE = 948.28;

export default function RalReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  let points: { [key: string]: { y: string; pts: string } } = {};

  try {
    points = params.points ? JSON.parse(params.points as string) : {};
  } catch {
    points = {};
  }

  // Example: Each point is $5.00, each Y is $2.50 (replace with your real logic)
  const getColorantTotal = () => {
    let total = 0;
    Object.values(points).forEach(({ y, pts }) => {
      total += (parseFloat(y || '0') * 2.5) + (parseFloat(pts || '0') * 5.0);
    });
    return total;
  };

  const colorantTotal = getColorantTotal();
  const totalBaseColorant = BASE_COST + colorantTotal;
  const utilidad = ((SALES_PRICE - totalBaseColorant) / totalBaseColorant) * 100;
  const total = SALES_PRICE - totalBaseColorant;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 16 }}>
        Costo de Producción RAL
      </ThemedText>
      <View style={styles.table}>
        <Row label="Costo Total Colorantes" value={`$${colorantTotal.toFixed(2)}`} />
        <Row label="Precio de Lista de Base" value={`$${BASE_LIST_PRICE.toFixed(2)}`} />
        <Row label="Descuento Semestral" value={''} />
        <Row label="Costo de Base" value={`$${BASE_COST.toFixed(2)}`} />
        <Row label="TOTAL BASE  +  COLORANTE" value={`$${totalBaseColorant.toFixed(2)}`} />
        <Row label="Precio de Venta" value={`$${SALE_PRICE.toFixed(2)}`} />
        <Row label="PRECIO DE VENTAS" value={`$${SALES_PRICE.toFixed(2)}`} />
        <Row label="UTILIDAD EN %" value={`${utilidad.toFixed(0)}%`} />
        <Row label="TOTAL" value={`$${total.toFixed(2)}`} />
      </View>
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Regresar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
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
  button: {
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