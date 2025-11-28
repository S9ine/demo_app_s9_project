from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
from typing import Union


def to_decimal(value: Union[str, int, float, Decimal], places: int = 2) -> Decimal:
    """
    Convert value to Decimal with specified decimal places
    
    Args:
        value: Value to convert
        places: Number of decimal places (default: 2)
        
    Returns:
        Decimal value rounded to specified places
        
    Example:
        >>> to_decimal(1500.50)
        Decimal('1500.50')
        >>> to_decimal("1500.505", places=2)
        Decimal('1500.51')
    """
    try:
        dec = Decimal(str(value))
        quantizer = Decimal('0.1') ** places
        return dec.quantize(quantizer, rounding=ROUND_HALF_UP)
    except (ValueError, InvalidOperation):
        return Decimal('0.00')


def calculate_sum(values: list[Union[str, int, float, Decimal]]) -> Decimal:
    """
    Calculate sum of values with Decimal precision
    
    Args:
        values: List of values to sum
        
    Returns:
        Sum of values as Decimal
        
    Example:
        >>> calculate_sum([1500.50, 250.25, 100])
        Decimal('1850.75')
    """
    total = Decimal('0.00')
    for value in values:
        total += to_decimal(value)
    return total


def decimal_to_float(value: Decimal) -> float:
    """
    Convert Decimal to float for JSON serialization
    
    Args:
        value: Decimal value
        
    Returns:
        Float value
    """
    return float(value)


def format_currency(value: Union[Decimal, float, int], symbol: str = "฿") -> str:
    """
    Format value as currency string
    
    Args:
        value: Numeric value
        symbol: Currency symbol (default: ฿)
        
    Returns:
        Formatted currency string
        
    Example:
        >>> format_currency(1500.50)
        '฿1,500.50'
    """
    dec = to_decimal(value)
    return f"{symbol}{dec:,.2f}"
