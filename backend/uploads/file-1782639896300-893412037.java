import java.io.*; 
import java.net.*; 
import java.util.Scanner;
public class BitStuffingClient {
	public static void main(String[] args) throws IOException {
		// Opens a socket for connection 
        Socket socket = new Socket("localhost", 6789); 
        DataInputStream dis = new DataInputStream(socket.getInputStream()); 
        DataOutputStream dos = new DataOutputStream(socket.getOutputStream()); 
        // Scanner class object to take input 
        Scanner sc = new Scanner(System.in); 
        // Takes input of unstuffed data from user 
        System.out.println("Enter data: "); 
        String data = sc.nextLine(); 
        int cnt = 0; 
        String s = ""; 
        for (int i = 0; i < data.length(); i++) { 
            char ch = data.charAt(i); 
            if (ch == '1') { 
                // count number of consecutive 1's 
                // in user's data 
                cnt++; 
                if (cnt < 5) 
                    s += ch; 
                else { 
                    // add one '0' after 5 consecutive 1's 
                    s = s + ch + '0'; 
                    cnt = 0; 
                } 
            } 
            else { 
                s += ch; 
                cnt = 0; 
            } 
        } 
        // uegfwieuadd flag byte in the beginning 
        // and end of stuffed data 
        s = "01111110" + s + "01111110"; 
        System.out.println("Data stuffed in client: " + s); 
        System.out.println("Sending to server for unstuffing"); 
        dos.writeUTF(s);
	}

}