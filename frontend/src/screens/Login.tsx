import React, { useState } from "react";
import { Text, View, KeyboardAvoidScrollView, Input, Button, OverlaySpinner, useMessage, Divider, Card, VStack } from "react-native-native-ui";
import { auth } from '../FirebaseConfig';

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const { showMessage } = useMessage();

    const onSubmit = async () => {
        setLoading(true);
        try {
            if (mode == 'register') {
                if (password != confirmPassword)
                    throw new Error('Passwords do not match');
                await auth().createUserWithEmailAndPassword(email, password);
            }
            else {
                await auth().signInWithEmailAndPassword(email, password);
            }
        }
        catch (error) {
            setLoading(false);
            let message = 'Error signing in';
            switch (error.code) {
                case 'auth/user-not-found':
                    message = 'User was not found. Consider registering.';
                    break;
                case 'auth/wrong-password':
                    message = 'Invalid password';
                    break;
                case 'auth/invalid-email':
                    message = 'Invalid email address';
                    break;
                case 'auth/email-already-in-use':
                    message = 'Email already in use';
                    break;
                case 'auth/user-disabled':
                    message = 'User has been disabled';
                    break;
            }
            showMessage({ title: 'Auth Error', text: message, status: "error" });
        }
    }

    return (
        <KeyboardAvoidScrollView style={{ flex: 1 }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Card style={{ maxWidth: 600, width: '80%' }}>
                    <VStack>
                        <View>
                            <Text variant='heading'>{mode == 'register' ? 'Register' : 'Login'}</Text>
                            <Divider/>
                        </View>
                        <Input label='Email' placeholder="Email" value={email} onChangeText={setEmail} />
                        <Input label='Password' placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
                        {mode == 'register' && <Input label='Confirm Password' placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />}
                        <Button variant='link'
                            title={mode == 'register' ? 'Already have an account? Sign in' : 'New here? Register'}
                            onPress={() => setMode(mode == 'register' ? 'login' : 'register')}
                        />
                        <Button title={mode == 'register' ? 'Register' : 'Login'} onPress={onSubmit} />
                    </VStack>
                </Card>
            </View>
            {loading && <OverlaySpinner />}
        </KeyboardAvoidScrollView>
    );
}