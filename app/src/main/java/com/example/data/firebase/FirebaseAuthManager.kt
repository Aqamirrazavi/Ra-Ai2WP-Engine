package com.example.data.firebase

import android.content.Context
import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import com.example.data.model.UserProfile
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.tasks.await

class FirebaseAuthManager(private val context: Context) {

    private val auth: FirebaseAuth by lazy {
        FirebaseAuth.getInstance()
    }

    private val _currentUserProfile = MutableStateFlow<UserProfile?>(null)
    val currentUserProfile: StateFlow<UserProfile?> = _currentUserProfile

    init {
        auth.addAuthStateListener { firebaseAuth ->
            val user = firebaseAuth.currentUser
            _currentUserProfile.value = user?.toUserProfile()
        }
        val initialUser = auth.currentUser
        if (initialUser != null) {
            _currentUserProfile.value = initialUser.toUserProfile()
        }
    }

    suspend fun signInAnonymously(): Result<UserProfile> {
        return try {
            val result = auth.signInAnonymously().await()
            val profile = result.user?.toUserProfile()
                ?: UserProfile(uid = "guest_${System.currentTimeMillis()}", displayName = "کاربر مهمان (Guest)", email = "guest@rtw.local", isAnonymous = true)
            _currentUserProfile.value = profile
            Result.success(profile)
        } catch (e: Exception) {
            Log.e("FirebaseAuthManager", "Anonymous auth failed", e)
            // Local fallback profile
            val fallback = UserProfile(
                uid = "offline_user",
                displayName = "توسعه‌دهنده محلی (Local Dev)",
                email = "dev@rtw.studio",
                isAnonymous = true
            )
            _currentUserProfile.value = fallback
            Result.success(fallback)
        }
    }

    suspend fun signInWithGoogle(): Result<UserProfile> {
        return try {
            val credentialManager = CredentialManager.create(context)
            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId("dummy-client-id-placeholder")
                .setAutoSelectEnabled(false)
                .build()

            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()

            val response = credentialManager.getCredential(context, request)
            val credential = response.credential

            if (credential is androidx.credentials.CustomCredential &&
                credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
            ) {
                val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                val idToken = googleIdTokenCredential.idToken
                val authCredential = GoogleAuthProvider.getCredential(idToken, null)
                val authResult = auth.signInWithCredential(authCredential).await()
                val user = authResult.user?.toUserProfile()
                if (user != null) {
                    _currentUserProfile.value = user
                    Result.success(user)
                } else {
                    signInAnonymously()
                }
            } else {
                signInAnonymously()
            }
        } catch (e: GetCredentialException) {
            Log.d("FirebaseAuthManager", "Google credential exception: ${e.message}, falling back to guest auth")
            signInAnonymously()
        } catch (e: Exception) {
            Log.e("FirebaseAuthManager", "Google sign-in general exception", e)
            signInAnonymously()
        }
    }

    fun signOut() {
        try {
            auth.signOut()
        } catch (e: Exception) {
            Log.e("FirebaseAuthManager", "Sign out error", e)
        }
        _currentUserProfile.value = null
    }

    private fun FirebaseUser.toUserProfile(): UserProfile {
        return UserProfile(
            uid = uid,
            displayName = displayName ?: if (isAnonymous) "کاربر مهمان (Guest)" else "کاربر وردپرس",
            email = email ?: "user@rtw.studio",
            photoUrl = photoUrl?.toString(),
            isAnonymous = isAnonymous
        )
    }
}
