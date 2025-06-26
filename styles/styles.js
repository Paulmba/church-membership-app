// styles/styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
	background: {
		flex: 1,
		justifyContent: 'center',
	},
	container: {
		padding: 20,
		flex: 1,
		justifyContent: 'center',
	},
	title: {
		fontSize: 26,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 30,
		color: '#fff',
	},
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#ccc',
		backgroundColor: '#fff',
		borderRadius: 8,
		paddingHorizontal: 10,
		marginBottom: 15,
	},
	inputField: {
		flex: 1,
		paddingVertical: 10,
		paddingLeft: 10,
	},
	label: {
		marginBottom: 5,
		fontWeight: '600',
		color: '#fff',
	},
	picker: {
		backgroundColor: '#fff',
		borderRadius: 8,
		marginBottom: 15,
	},
	dateInput: {
		backgroundColor: '#fff',
		padding: 12,
		borderRadius: 8,
		marginBottom: 15,
	},
	iconRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-around',
		marginBottom: 20,
	},
	card: {
		width: '40%',
		backgroundColor: '#ffffffcc',
		borderRadius: 10,
		paddingVertical: 20,
		alignItems: 'center',
		marginBottom: 15,
		elevation: 4,
	},
	cardText: {
		marginTop: 8,
		fontSize: 14,
		fontWeight: '500',
		color: '#333',
	},
	sectionBox: {
		backgroundColor: '#ffffffcc',
		borderRadius: 8,
		padding: 15,
		marginBottom: 15,
	},
	sectionTitle: {
		fontWeight: 'bold',
		fontSize: 16,
		marginBottom: 5,
		color: '#222',
	},
	sectionContent: {
		fontSize: 14,
		color: '#444',
	},
});
