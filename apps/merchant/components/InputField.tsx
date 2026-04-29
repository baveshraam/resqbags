import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerStyle?: ViewStyle | ViewStyle[];
}

export function InputField({ label, error, helperText, required, containerStyle, style, ...props }: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.inputGroup, containerStyle]}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.requiredMark}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          props.multiline && styles.textArea,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={Colors.warmTaupe}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        textAlignVertical={props.multiline ? 'top' : 'center'}
        {...props}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.deepEspresso,
  },
  requiredMark: {
    color: Colors.terracotta,
  },
  input: {
    backgroundColor: Colors.offWhite,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: Colors.deepEspresso,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputFocused: {
    borderColor: Colors.forestGreen,
    borderWidth: 2,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  inputError: {
    borderColor: Colors.terracotta,
    borderWidth: 2,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  textArea: {
    height: 100,
  },
  errorText: {
    color: Colors.terracotta,
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: Colors.warmStone,
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    marginTop: 4,
  },
});
