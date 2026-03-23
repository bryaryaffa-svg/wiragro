package com.sidomakmur.kios.feature.catalog

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.sidomakmur.kios.data.pricing.priceDisplay
import com.sidomakmur.kios.data.remote.ProductSummary
import com.sidomakmur.kios.data.session.SessionRole
import java.text.NumberFormat
import java.util.Locale

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ProductCard(
    product: ProductSummary,
    sessionRole: SessionRole,
    isWishlisted: Boolean,
    isWishlistBusy: Boolean,
    isCartBusy: Boolean,
    cartQty: Int = 0,
    onOpenProduct: (String) -> Unit,
    onToggleWishlist: (ProductSummary) -> Unit,
    onAddToCart: (ProductSummary) -> Unit,
    onIncreaseQty: (() -> Unit)? = null,
    onDecreaseQty: (() -> Unit)? = null,
    compact: Boolean = false,
    modifier: Modifier = Modifier,
) {
    val imageUrl = product.images.firstOrNull { it.isPrimary }?.url ?: product.images.firstOrNull()?.url
    val priceDisplay = product.priceDisplay(sessionRole)
    val tags = buildList {
        if (product.badges.featured) add("Unggulan")
        if (product.badges.newArrival) add("Baru")
        if (product.badges.bestSeller) add("Terlaris")
        if (priceDisplay.isResellerPrice) add("Harga Reseller")
        if (priceDisplay.compareAmount != null && !priceDisplay.isResellerPrice) add("Promo")
    }
    val stockLabel = if (priceDisplay.amount.isNullOrBlank()) "Cek stok" else "Stok aktif"
    val imageHeight = if (compact) 128.dp else 180.dp
    val bodyPadding = if (compact) 12.dp else 16.dp

    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight()
                .clickable { onOpenProduct(product.slug) }
                .padding(bodyPadding),
            verticalArrangement = Arrangement.spacedBy(if (compact) 10.dp else 12.dp),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(imageHeight)
                    .clip(RoundedCornerShape(20.dp))
                    .background(
                        brush = Brush.linearGradient(
                            listOf(
                                MaterialTheme.colorScheme.primaryContainer,
                                MaterialTheme.colorScheme.secondaryContainer,
                            ),
                        ),
                    ),
            ) {
                if (!imageUrl.isNullOrBlank()) {
                    AsyncImage(
                        model = imageUrl,
                        contentDescription = product.name,
                        modifier = Modifier.matchParentSize(),
                        contentScale = ContentScale.Crop,
                    )
                } else {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Image,
                            contentDescription = null,
                            modifier = Modifier.size(36.dp),
                        )
                        Text(
                            text = product.productType.ifBlank { "Produk Pertanian" },
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold,
                        )
                    }
                }
                IconButton(
                    onClick = { onToggleWishlist(product) },
                    enabled = !isWishlistBusy,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .background(
                            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.85f),
                            shape = RoundedCornerShape(999.dp),
                        ),
                ) {
                    Icon(
                        imageVector = if (isWishlisted) {
                            Icons.Filled.Favorite
                        } else {
                            Icons.Outlined.FavoriteBorder
                        },
                        contentDescription = if (isWishlisted) {
                            "Hapus dari wishlist"
                        } else {
                            "Simpan ke wishlist"
                        },
                        tint = if (isWishlisted) {
                            MaterialTheme.colorScheme.primary
                        } else {
                            MaterialTheme.colorScheme.onSurface
                        },
                    )
                }
            }

            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = product.name,
                    style = if (compact) MaterialTheme.typography.titleSmall else MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    maxLines = if (compact) 2 else 3,
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = product.productType.ifBlank { "Produk" },
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    Text(
                        text = product.unit.ifBlank { "pcs" },
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                product.summary?.takeIf { it.isNotBlank() }?.let { summary ->
                    Text(
                        text = summary,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = if (compact) 2 else 3,
                    )
                }
            }

            if (tags.isNotEmpty()) {
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    tags.forEach { label ->
                        Surface(
                            color = if (label == "Harga Reseller") {
                                MaterialTheme.colorScheme.tertiaryContainer
                            } else {
                                MaterialTheme.colorScheme.primaryContainer
                            },
                            shape = MaterialTheme.shapes.large,
                        ) {
                            Text(
                                text = label,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onPrimaryContainer,
                            )
                        }
                    }
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(5.dp),
                ) {
                    PricePill(
                        amount = priceDisplay.amount,
                        label = priceDisplay.label,
                        compareAmount = priceDisplay.compareAmount,
                    )
                    priceDisplay.compareAmount?.takeIf { it.isNotBlank() }?.let { compare ->
                        Text(
                            text = formatCurrency(compare),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textDecoration = TextDecoration.LineThrough,
                        )
                    }
                    Text(
                        text = priceDisplay.minQty?.let { "Min. beli $it ${product.unit}" } ?: "Min. beli 1 ${product.unit}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        shape = RoundedCornerShape(999.dp),
                    ) {
                        Text(
                            text = stockLabel,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                            style = MaterialTheme.typography.labelSmall,
                        )
                    }
                }
                Column(
                    horizontalAlignment = Alignment.End,
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    FilledTonalButton(onClick = { onOpenProduct(product.slug) }) {
                        Text(if (compact) "Detail" else "Lihat detail")
                    }
                    if (cartQty > 0 && onIncreaseQty != null && onDecreaseQty != null) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            OutlinedButton(
                                onClick = onDecreaseQty,
                                enabled = !isCartBusy,
                                modifier = Modifier.size(42.dp),
                            ) {
                                Text("-")
                            }
                            Text(
                                text = cartQty.toString(),
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                            )
                            OutlinedButton(
                                onClick = onIncreaseQty,
                                enabled = !isCartBusy,
                                modifier = Modifier.size(42.dp),
                            ) {
                                Text("+")
                            }
                        }
                    } else {
                        OutlinedButton(
                            onClick = { onAddToCart(product) },
                            enabled = !isCartBusy,
                        ) {
                            Text(
                                when {
                                    isCartBusy -> "Memproses..."
                                    sessionRole == SessionRole.GUEST -> "Login dulu"
                                    compact -> "Tambah"
                                    else -> "Tambah cart"
                                },
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PricePill(
    amount: String?,
    label: String,
    compareAmount: String? = null,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier,
        color = MaterialTheme.colorScheme.secondaryContainer,
        shape = MaterialTheme.shapes.large,
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(2.dp),
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSecondaryContainer,
            )
            Text(
                text = formatCurrency(amount),
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold,
            )
            compareAmount?.takeIf { it.isNotBlank() }?.let { value ->
                Text(
                    text = "Harga umum ${formatCurrency(value)}",
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }
    }
}

fun formatCurrency(
    amount: String?,
): String {
    val value = amount?.toDoubleOrNull() ?: 0.0
    return NumberFormat.getCurrencyInstance(Locale("id", "ID")).format(value)
}
