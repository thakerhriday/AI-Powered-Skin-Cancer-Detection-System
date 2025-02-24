package com.ishaanbhela.skincancerdetection;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.pdf.PdfRenderer;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.itextpdf.text.pdf.PdfReader;
import com.itextpdf.text.pdf.parser.PdfTextExtractor;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class Detect extends AppCompatActivity {

    private ImageView imageView;
    private Button btnGallery, btnCamera, btnUploadPdf, btnDetect;
    private TextView txtModelOutput, txtGeminiOutput;
    private Bitmap selectedImage;
    private FirebaseFirestore db;
    Uri PDFURI = null;
    String pdfText = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_detect);

        imageView = findViewById(R.id.imagePreview);
        btnGallery = findViewById(R.id.btnGallery);
        btnCamera = findViewById(R.id.btnCamera);
        btnUploadPdf = findViewById(R.id.btnUploadPDF);
        btnDetect = findViewById(R.id.btnDetect);
        txtModelOutput = findViewById(R.id.tvClassification);
        txtGeminiOutput = findViewById(R.id.tvGeminiOutput);

        db = FirebaseFirestore.getInstance();

        btnGallery.setOnClickListener(view -> pickImageFromGallery());
        btnCamera.setOnClickListener(view -> captureImageFromCamera());
        btnUploadPdf.setOnClickListener(view -> pickPdfFromFile());
        btnDetect.setOnClickListener(view -> sendImageToApi());
    }

    private void pickImageFromGallery() {
        Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        imagePickerLauncher.launch(intent);
    }

    private void captureImageFromCamera() {
        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        cameraLauncher.launch(intent);
    }

    private void pickPdfFromFile() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("application/pdf");
        pdfPickerLauncher.launch(intent);
    }

    private final ActivityResultLauncher<Intent> imagePickerLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(), result -> {
                if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                    Uri imageUri = result.getData().getData();
                    try {
                        selectedImage = MediaStore.Images.Media.getBitmap(this.getContentResolver(), imageUri);
                        imageView.setImageBitmap(selectedImage);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
    );

    private final ActivityResultLauncher<Intent> cameraLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(), result -> {
                if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                    Bundle extras = result.getData().getExtras();
                    if (extras != null) {
                        selectedImage = (Bitmap) extras.get("data");
                        imageView.setImageBitmap(selectedImage);
                    }
                }
            }
    );

    private final ActivityResultLauncher<Intent> pdfPickerLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(), result -> {
                if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                    Uri pdfUri = result.getData().getData();
                    PDFURI = pdfUri;
                    System.out.println("**********************************");
                    System.out.println(PDFURI == null);
                }
            }
    );

    private void sendImageToApi() {
        if (selectedImage == null) {
            Toast.makeText(this, "No image selected", Toast.LENGTH_SHORT).show();
            return;
        }

        String encodedImage = encodeImageToBase64(selectedImage);
        JSONObject jsonRequest = new JSONObject();
        try {
            jsonRequest.put("image_base64", encodedImage);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        RequestQueue queue = Volley.newRequestQueue(this);
        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(
                Request.Method.POST,
                "https://jy6t1jop21.execute-api.ap-south-1.amazonaws.com/test/detect",
                jsonRequest,
                response -> {
                    try {
                        String prediction = response.getString("prediction");
                        double confidence = response.getDouble("confidence");
                        String resultText = prediction.equals("Class 0") ? "Benign (Non-cancerous)" : "Malignant (Cancerous)";
                        txtModelOutput.setText(resultText);
                        processPdfWithGemini(PDFURI, resultText);
                        saveToFirestore(encodedImage, resultText, "Pending");
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                },
                error -> {
                    Toast.makeText(this, "Upload failed! " + error.getMessage(), Toast.LENGTH_LONG).show();
                    error.printStackTrace();
                }
        );
        queue.add(jsonObjectRequest);
    }

    private void processPdfWithGemini(Uri pdfUri, String modelOutput) {
        // TODO: Implement Gemini API call
        InputStream inputStream = null;
        try{
            inputStream = this.getContentResolver().openInputStream(pdfUri);
        }catch (Exception e){

        }

        String fileContent = "";
        StringBuilder builder = new StringBuilder();
        PdfReader reader = null;
        try{
            System.out.println("ERROR AT 185");
            reader = new PdfReader(inputStream);
            System.out.println("ERROR AT 187");
            int pages = reader.getNumberOfPages();
            for(int i=1; i<=pages; i++){
                fileContent = PdfTextExtractor.getTextFromPage(reader, i);
                builder.append(fileContent);
                System.out.println(builder);
            }


            reader.close();

            pdfText = "Based on this medical history, generate a personalized treatment and follow-up plan of action if the patient is diagnosed with stage 2 skin cancer:" + builder + " Skin Cancer detection: " + modelOutput;
            Log.d("pdfText", "*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************" + pdfText);

        }catch (Exception e){

            System.out.println("************************************************************************************\n" + e.toString());
        }

        String apiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=AIzaSyBT4v2DIuDyWv39qmhByiHQ0vI4OderyyQ";

        // Prepare the JSON object for the POST request
        JSONObject requestPayload = new JSONObject();
        try {
            // Create a textContent JSON object with the extracted text
            JSONObject textContent = new JSONObject();
            textContent.put("text", "Based on this medical history, generate a personalized treatment and follow-up plan of action if the patient is diagnosed with stage 2 skin cancer: " + pdfText);

            // Create the parts array containing the textContent
            JSONArray partsArray = new JSONArray();
            partsArray.put(textContent);

            // Create the partsObject and contentsArray
            JSONObject partsObject = new JSONObject();
            partsObject.put("parts", partsArray);

            JSONArray contentsArray = new JSONArray();
            contentsArray.put(partsObject);

            // Add the contents array to the requestPayload
            requestPayload.put("contents", contentsArray);

            System.out.println(requestPayload);

        } catch (JSONException e) {
            e.printStackTrace();
        }

        // Create a request queue
        RequestQueue requestQueue = Volley.newRequestQueue(this);

        // Create the JSON request for the Gemini API
        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(
                Request.Method.POST,
                apiUrl,
                requestPayload,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            // Log the full response for debugging
                            Log.d("GeminiResponse", response.toString());

                            // Check for error in the response
                            if (response.has("error")) {
                                // Handle API error
                                JSONObject error = response.getJSONObject("error");
                                String errorMessage = error.getString("message");
                                Log.e("GeminiAPIError", errorMessage);
                                Toast.makeText(Detect.this, "API Error: " + errorMessage, Toast.LENGTH_SHORT).show();
                            } else {
                                // Extract the summary or generated content
                                String summary = response.optJSONArray("candidates")
                                        .optJSONObject(0)
                                        .optJSONObject("content")
                                        .optJSONArray("parts")
                                        .optJSONObject(0)
                                        .optString("text", "No summary received");

                                // Display the summary
                                txtGeminiOutput.setText(summary);

                                // Optionally save to Firestore
                                saveToFirestore("", "Pending", summary);
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        // Handle error
                        Log.e("GeminiAPIError", "Error: " + error.toString());

                        if (error.getMessage() != null) {
                            Log.e("GeminiAPIError", "Message: " + error.getMessage());
                        } else {
                            Log.e("GeminiAPIError", "Error message is null");
                        }

                        // Check if there's a network response (i.e., HTTP status code)
                        if (error.networkResponse != null) {
                            Log.e("GeminiAPIError", "Status Code: " + error.networkResponse.statusCode);
                            Log.e("GeminiAPIError", "Response Data: " + new String(error.networkResponse.data));
                        }

                        // Check if there's a cause for the error
                        if (error.getCause() != null) {
                            Log.e("GeminiAPIError", "Cause: " + error.getCause().toString());
                        }

                        Toast.makeText(Detect.this, "Error: " + error.getMessage(), Toast.LENGTH_LONG).show();
                    }
                }
        );

        jsonObjectRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000,  // Timeout in milliseconds (10 seconds)
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,  // You can adjust the number of retries if necessary
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT  // Default backoff multiplier
        ));

        // Add the request to the queue
        requestQueue.add(jsonObjectRequest);
    }

    private void saveToFirestore(String base64Image, String modelOutput, String geminiOutput) {
        FirebaseUser currentUser = FirebaseAuth.getInstance().getCurrentUser();

        if (currentUser == null) {
            Toast.makeText(this, "User not authenticated", Toast.LENGTH_SHORT).show();
            return;
        }

        String userId = currentUser.getUid();  // Get the authenticated user's UID
        String monthYear = new SimpleDateFormat("MM-yyyy", Locale.getDefault()).format(new Date());

        Map<String, Object> formEntry = new HashMap<>();
        formEntry.put("base64Image", base64Image);
        formEntry.put("modelOutput", modelOutput);
        formEntry.put("geminiOutput", geminiOutput);
        formEntry.put("monthYear", monthYear);
        formEntry.put("timestamp", new Date()); // Store timestamp for ordering
        formEntry.put("UserID", userId);
        formEntry.put("DoctorReview", "Not Reviewed Yet.");
        formEntry.put("reviewed", "False");

        // Save inside: Forms -> UserID -> Random Document ID
        db.collection("Forms") // Top-level collection
                .add(formEntry) // Create a random document inside "UserForms"
                .addOnSuccessListener(documentReference ->
                        Toast.makeText(this, "Saved to Firestore", Toast.LENGTH_SHORT).show())
                .addOnFailureListener(e ->
                        Toast.makeText(this, "Error saving to Firestore", Toast.LENGTH_SHORT).show());
    }

    private String encodeImageToBase64(Bitmap image) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        image.compress(Bitmap.CompressFormat.JPEG, 100, byteArrayOutputStream);
        byte[] byteArray = byteArrayOutputStream.toByteArray();
        return Base64.encodeToString(byteArray, Base64.DEFAULT);
    }
}