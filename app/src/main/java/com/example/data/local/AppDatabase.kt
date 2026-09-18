package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import androidx.room.Delete
import androidx.room.Database
import androidx.room.RoomDatabase
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "conversions")
data class ConversionEntity(
    @PrimaryKey val id: String,
    val projectName: String,
    val outputTypeId: String,
    val aiModelModeId: String,
    val inputCode: String,
    val status: String,
    val thinkingSummary: String,
    val generatedFilesJson: String, // serialized list of GeneratedFile
    val timestamp: Long,
    val userId: String,
    val artifactUrl: String
)

@Entity(tableName = "assets")
data class AssetEntity(
    @PrimaryKey val id: String,
    val prompt: String,
    val editPrompt: String,
    val assetType: String,
    val imageBase64: String?,
    val imageUrl: String?,
    val timestamp: Long,
    val userId: String
)

@Dao
interface ConversionDao {
    @Query("SELECT * FROM conversions ORDER BY timestamp DESC")
    fun getAllConversions(): Flow<List<ConversionEntity>>

    @Query("SELECT * FROM conversions WHERE id = :id LIMIT 1")
    suspend fun getConversionById(id: String): ConversionEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertConversion(conversion: ConversionEntity)

    @Update
    suspend fun updateConversion(conversion: ConversionEntity)

    @Delete
    suspend fun deleteConversion(conversion: ConversionEntity)

    @Query("DELETE FROM conversions WHERE id = :id")
    suspend fun deleteById(id: String)
}

@Dao
interface AssetDao {
    @Query("SELECT * FROM assets ORDER BY timestamp DESC")
    fun getAllAssets(): Flow<List<AssetEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAsset(asset: AssetEntity)

    @Delete
    suspend fun deleteAsset(asset: AssetEntity)
}

@Database(entities = [ConversionEntity::class, AssetEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun conversionDao(): ConversionDao
    abstract fun assetDao(): AssetDao
}
