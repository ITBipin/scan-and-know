import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  items?: string[];
  description?: string;
};

export default function ResultCard({ title, items, description }: Props) {
  const hasItems = Array.isArray(items) && items.length > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {hasItems ? (
        <View style={styles.list}> 
          {items!.map((item) => (
            <Text key={item} style={styles.item}>• {item}</Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',

  },
  description: {
    marginTop: 8,
    color: '#374151',
    lineHeight: 22,
  },
  list: {
    marginTop: 10,
  },
  item: {
    color: '#374151',
    lineHeight: 24,
    marginBottom: 4,
  },
});
