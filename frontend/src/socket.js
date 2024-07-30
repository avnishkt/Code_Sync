import { io } from 'socket.io-client'
import BASE_URL from './config';
export const initSocket = () => {
    const options = {
        'force new connection': true,
        reconnectioAttempts: 'Infinity',
        timeout: 10000,
        transports: ['websocket']
    } 

    return io(BASE_URL, options)
}