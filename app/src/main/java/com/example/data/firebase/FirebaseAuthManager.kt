package com.example.data.firebase

import android.content.Context
import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import com.example.data.model.UserProfile
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.tasks.await

class FirebaseAuthManager(private val context: Context) {

    private val auth: FirebaseAuth? by lazy {
        try {
            if (FirebaseApp.getApps(context).isNotEmpty()) {
                FirebaseAuth.getInstance()
            } else {
                null
            }
        } catch (e: Exception) {
            Log.w("FirebaseAuthManager", "Unable to obtain FirebaseAuth instance", e)
            null
        }
    }

    private val _currentUserProfile = MutableStateFlow<UserProfile?>(null)
    val currentUserProfile: StateFlow<UserProfile?> = _currentUserProfile

    init {
        try {
            val currentAuth = auth
            if (currentAuth != null) {
                currentAuth.addAuthStateListener { firebaseAuth ->
                    val user = firebaseAuth.currentUser
                    _currentUserProfile.value = user?.toUserProfile() ?: defaultGuestProfile()
                }
                val initialUser = currentAuth.currentUser
                _currentUserProfile.value = initialUser?.toUserProfile() ?: defaultGuestProfile()
            } else {
                _currentUserProfile.value = defaultGuestProfile()
            }
        } catch (e: Exception) {
            Log.w("FirebaseAuthManager", "Auth state listener initialization failed, using default profile", e)
            _currentUserProfile.value = defaultGuestProfile()
        }
    }

    private fun defaultGuestProfile(): UserProfile {
        return UserProfile(
            uid = "local_dev_user",
            displayName = "توسعه‌دهنده محلی (Local Dev)",
            email = "dev@rtw.studio",
            isAnonymous = true
        )
    }

    suspend fun signInAnonymously(): Result<UserProfile> {
        val currentAuth = auth
        if (currentAuth == null) {
            val fallback = defaultGuestProfile()
            _currentUserProfile.value = fallback
            return Result.success(fallback)
        }

        return try {
            val result = currentAuth.signInAnonymously().await()
            val profile = result.user?.toUserProfile() ?: defaultGuestProfile()
            _currentUserProfile.value = profile
            Result.success(profile)
        } catch (e: Exception) {
            Log.e("FirebaseAuthManager", "Anonymous auth failed", e)
            val fallback = defaultGuestProfile()
            _currentUserProfile.value = fallback
            Result.success(fallback)
        }
    }

    suspend fun signInWithGoogle(): Result<UserProfile> {
        val currentAuth = auth
        if (currentAuth == null) {
            return signInAnonymously()
        }

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
                val authResult = currentAuth.signInWithCredential(authCredential).await()
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
            auth?.signOut()
        } catch (e: Exception) {
            Log.e("FirebaseAuthManager", "Sign out error", e)
        }
        _currentUserProfile.value = defaultGuestProfile()
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
