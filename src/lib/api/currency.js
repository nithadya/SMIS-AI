import { supabase } from '../supabase.js';

// Get current user from auth context
const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return user;
};

// Get all active exchange rates
export const getExchangeRates = async () => {
  try {
    const { data, error } = await supabase
      .from('currency_exchange_rates')
      .select('*')
      .eq('is_active', true)
      .order('base_currency', { ascending: true })
      .order('target_currency', { ascending: true });

    if (error) {
      console.error('Error fetching exchange rates:', error);
      throw error;
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getExchangeRates:', error);
    return { data: [], error: error.message };
  }
};

// Get specific exchange rate
export const getExchangeRate = async (baseCurrency, targetCurrency) => {
  try {
    const { data, error } = await supabase
      .from('currency_exchange_rates')
      .select('*')
      .eq('base_currency', baseCurrency)
      .eq('target_currency', targetCurrency)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching exchange rate:', error);
      throw error;
    }

    return { data: data || null, error: null };
  } catch (error) {
    console.error('Error in getExchangeRate:', error);
    return { data: null, error: error.message };
  }
};

// Convert currency amount
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) {
      return { data: parseFloat(amount), error: null };
    }

    const { data: rate, error } = await getExchangeRate(fromCurrency, toCurrency);
    
    if (error || !rate) {
      return { data: null, error: `Exchange rate not found for ${fromCurrency} to ${toCurrency}` };
    }

    const convertedAmount = parseFloat(amount) * parseFloat(rate.exchange_rate);
    return { data: convertedAmount, error: null };
  } catch (error) {
    console.error('Error in convertCurrency:', error);
    return { data: null, error: error.message };
  }
};

// Get program with complete fee structure
export const getProgramWithFees = async (programId) => {
  try {
    // Get program details
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (programError) {
      console.error('Error fetching program:', programError);
      throw programError;
    }

    // Get international fee structure
    const { data: internationalFees, error: feesError } = await supabase
      .from('international_fee_structure')
      .select('*')
      .eq('program_id', programId)
      .order('fee_type', { ascending: true });

    if (feesError) {
      console.error('Error fetching international fees:', feesError);
      throw feesError;
    }

    // Get installment plans
    const { data: installmentPlans, error: plansError } = await supabase
      .from('payment_installment_plans')
      .select('*')
      .eq('program_id', programId)
      .eq('is_active', true)
      .order('total_installments', { ascending: true });

    if (plansError) {
      console.error('Error fetching installment plans:', plansError);
      throw plansError;
    }

    return {
      data: {
        program,
        internationalFees: internationalFees || [],
        installmentPlans: installmentPlans || []
      },
      error: null
    };
  } catch (error) {
    console.error('Error in getProgramWithFees:', error);
    return { data: null, error: error.message };
  }
};

// Get all programs with their fee structures
export const getAllProgramsWithFees = async () => {
  try {
    // First get all programs
    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .select('*')
      .order('name', { ascending: true });

    if (programsError) {
      console.error('Error fetching programs:', programsError);
      throw programsError;
    }

    // Then get fee structures for each program
    const programsWithFees = await Promise.all(
      programs.map(async (program) => {
        const { data: fees, error: feesError } = await supabase
          .from('international_fee_structure')
          .select('*')
          .eq('program_id', program.id);

        if (feesError) {
          console.error('Error fetching fees for program:', program.id, feesError);
        }

        return {
          ...program,
          international_fee_structure: fees || []
        };
      })
    );

    return { data: programsWithFees || [], error: null };
  } catch (error) {
    console.error('Error in getAllProgramsWithFees:', error);
    return { data: [], error: error.message };
  }
};

// Search programs with fee information
export const searchProgramsWithFees = async (searchTerm) => {
  try {
    // First search programs
    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('name', { ascending: true });

    if (programsError) {
      console.error('Error searching programs:', programsError);
      throw programsError;
    }

    // Then get fee structures and payment plans for each program
    const programsWithDetails = await Promise.all(
      programs.map(async (program) => {
        const [feesResult, plansResult] = await Promise.all([
          supabase
            .from('international_fee_structure')
            .select('*')
            .eq('program_id', program.id),
          supabase
            .from('payment_installment_plans')
            .select('*')
            .eq('program_id', program.id)
            .eq('is_active', true)
        ]);

        return {
          ...program,
          international_fee_structure: feesResult.data || [],
          payment_installment_plans: plansResult.data || []
        };
      })
    );

    return { data: programsWithDetails || [], error: null };
  } catch (error) {
    console.error('Error in searchProgramsWithFees:', error);
    return { data: [], error: error.message };
  }
};

// Update exchange rate
export const updateExchangeRate = async (baseCurrency, targetCurrency, newRate) => {
  try {
    const user = getCurrentUser();
    
    const { data, error } = await supabase
      .from('currency_exchange_rates')
      .update({
        exchange_rate: parseFloat(newRate),
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('base_currency', baseCurrency)
      .eq('target_currency', targetCurrency)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      console.error('Error updating exchange rate:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateExchangeRate:', error);
    return { data: null, error: error.message };
  }
};

// Format currency with proper symbols and formatting
export const formatCurrency = (amount, currency = 'LKR', locale = 'en-LK') => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return currency === 'LKR' ? 'Rs. 0.00' : `${currency} 0.00`;
  }

  const currencyMap = {
    'LKR': { symbol: 'Rs.', locale: 'en-LK' },
    'GBP': { symbol: '£', locale: 'en-GB' },
    'USD': { symbol: '$', locale: 'en-US' },
    'EUR': { symbol: '€', locale: 'en-EU' },
    'AUD': { symbol: 'A$', locale: 'en-AU' },
    'CAD': { symbol: 'C$', locale: 'en-CA' },
    'SGD': { symbol: 'S$', locale: 'en-SG' },
    'INR': { symbol: '₹', locale: 'en-IN' }
  };

  const currencyInfo = currencyMap[currency] || { symbol: currency, locale: 'en-US' };
  
  if (currency === 'LKR') {
    return `Rs. ${parseFloat(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  try {
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    return `${currencyInfo.symbol} ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
};

// Calculate installment amounts for a program
export const calculateInstallmentAmounts = async (programId, planId, studentType = 'local') => {
  try {
    const { data: programData, error: programError } = await getProgramWithFees(programId);
    
    if (programError || !programData) {
      throw new Error('Failed to fetch program data');
    }

    const plan = programData.installmentPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Installment plan not found');
    }

    // Calculate total program cost
    let totalAmount = 0;
    const feeBreakdown = [];

    for (const fee of programData.internationalFees) {
      const amount = studentType === 'international' 
        ? fee.international_amount_gbp 
        : fee.local_amount;
      const currency = studentType === 'international' 
        ? fee.currency_international 
        : fee.currency_local;
      
      totalAmount += parseFloat(amount);
      feeBreakdown.push({
        type: fee.fee_type,
        amount: parseFloat(amount),
        currency,
        description: fee.description
      });
    }

    // Calculate installment details
    const downPayment = parseFloat(plan.down_payment_amount || 0);
    const remainingAmount = totalAmount - downPayment;
    const installmentAmount = remainingAmount / plan.total_installments;

    return {
      data: {
        plan,
        totalAmount,
        downPayment,
        remainingAmount,
        installmentAmount,
        totalInstallments: plan.total_installments,
        feeBreakdown,
        currency: studentType === 'international' ? 'GBP' : 'LKR'
      },
      error: null
    };
  } catch (error) {
    console.error('Error in calculateInstallmentAmounts:', error);
    return { data: null, error: error.message };
  }
};

// Get real-time exchange rate from external API (optional)
export const fetchLiveExchangeRate = async (baseCurrency, targetCurrency) => {
  try {
    // This would typically call an external API like exchangerate-api.com
    // For now, we'll return the stored rate
    return await getExchangeRate(baseCurrency, targetCurrency);
  } catch (error) {
    console.error('Error fetching live exchange rate:', error);
    return { data: null, error: error.message };
  }
}; 