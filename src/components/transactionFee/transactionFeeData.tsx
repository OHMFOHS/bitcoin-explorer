import React from 'react';
import { graphqlClient } from "@/graphql/client";
import { BitqueryBitcoinNetwork, TransactionFeeDocument,TransactionFeeQuery } from "@/graphql/__generated__/graphql";
import TransactionFeeChart from './transactionFeeChart';

type TransactionFeeProps = {
  network?: BitqueryBitcoinNetwork; 
  limit?: number; 
};
  
  const formatFeeValueDecimal = (feeValueDecimal: number | undefined): number => {
    if (feeValueDecimal === undefined) return 0; 
    return parseFloat(feeValueDecimal.toFixed(3));
  };

  const formatDate = (date: string | undefined) => {
    if (date === undefined) return "";
    const dateString = date.toString();
    return dateString;
  };

  // const TransactionFeeData = async ({ network = 'bitcoin', limit = 7 }: TransactionFeeProps) => {
   async function TransactionFeeData({ network = 'bitcoin', limit = 7 }: TransactionFeeProps) {
  //  const TransactionFeeData: React.FC<TransactionFeeProps> = ({ network = 'bitcoin', limit = 7 }: TransactionFeeProps) => {
        const weekData = await graphqlClient.request(TransactionFeeDocument, {
          network: network,
          limit: limit,
        });

        const monthData = await graphqlClient.request(TransactionFeeDocument, {
          network: network,
          limit: 30,
        });

        const weekTransactionsData = weekData?.bitquery.bitcoin!.transactions|| [];

        const monthTransactionsData = monthData?.bitquery.bitcoin!.transactions|| [];

        const weekFormattedTransactions = weekTransactionsData.map(transaction => ({
        date: formatDate(transaction.date?.date),
        feeValueDecimal: formatFeeValueDecimal(parseFloat(transaction.feeValueDecimal))
      }));
        const monthFormattedTransactions = monthTransactionsData.map(transaction => ({
          date: formatDate(transaction.date?.date),
          feeValueDecimal: formatFeeValueDecimal(parseFloat(transaction.feeValueDecimal))
    }));
    
    return (
      <div>
      <h3>Bitcoin Daily Transaction fees</h3>
      <TransactionFeeChart data={weekFormattedTransactions}/>
      <TransactionFeeChart data={monthFormattedTransactions}/>
    </div>
    );
  }


export default TransactionFeeData;

