'use client'
import React, { useState, useEffect } from 'react';
import { graphqlClient } from "@/graphql/client";
import { GetCoinsDocument } from "@/graphql/__generated__/graphql";
import { GetCoinsWithSupplyDocument } from "@/graphql/__generated__/graphql";
import { CryptoCurrency } from '../types';
import '../components/CoinMarket.css';


interface CryptoRowProps {
  data: CryptoCurrency;
}

const CryptoRow: React.FC<CryptoRowProps> = ({ data }) => {
  const changeSymbol = Number(data.change) >= 0 ? '▲' : '▼';
   
    const changeStyle = {
      color: Number(data.change) >= 0 ? 'green' : 'red',
    };

    const formatNumber = (number: number | string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2, 
      }).format(Number(number)); 
    };
    


  return (
    <tr className="table-row">
      <td>
        <img 
          src={data.iconUrl} 
          alt={`${data.name} icon`} 
          style={{ width: '24px', height: '24px' }} // Adjust the size as needed
        />
      </td>
      <td>{data.name}</td>
      <td>{formatNumber(parseFloat(data.marketCap))} USD</td>
      <td>{formatNumber(data.price)} USD</td>
      <td>{data.rank}</td>
      <td>{formatNumber(data.circulatingSupply ?? '')}</td>
      <td>{formatNumber(parseFloat(data.maxSupply ?? ''))}</td>
      <td style={changeStyle}>
      <span style={changeStyle}>{changeSymbol}</span> {data.change}%
    </td>
      <td>
        <button className = "rowbutton">View</button>
        <button className = "rowbutton">Explore</button>
      </td>
    </tr>
  );
};



interface CryptoTableProps {
  cryptos: CryptoCurrency[];
}

const CryptoTable: React.FC<CryptoTableProps> = ({ cryptos }) => {
  return (
    <table className="table">
      <thead>
        <tr className="table-header">
          <th>Icon</th>
          <th>Name</th>
          <th>Market Cap</th>
          <th>Price</th>
          <th>rank</th>
          <th>Circulating Supply</th>
          <th>Max Supply</th>
          <th>Change 24h</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {cryptos.map((crypto) => (
          <CryptoRow key={crypto.uuid} data={crypto} />
        ))}
      </tbody>
    </table>
  );
};




const App: React.FC = () => {
  const [cryptos, setCryptos] = useState<CryptoCurrency[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setItemsPerPage] = useState(10); 


  const goToPage = (number: number) => {
    setCurrentPage(number);
  };


  useEffect(() => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
    const fetchCryptos = async () => {
      try {
        const offset = (currentPage - 1) * limit;
        const variables = { limit, offset };
  
        // 使用GraphQL客户端请求获取加密货币列表
        const response = await graphqlClient.request(GetCoinsDocument, variables);
        let coinsData = response.rapaidapi.cryptocurrencyListResponse.data.coins;
  
        // 准备容纳带有供应信息的加密货币的数组
        let coinsWithSupply = [];
  
        // 遍历每一个加密货币，获取它们的供应信息
        for (const coin of coinsData) {
          const supplyVariables = { coinUuid: coin.uuid };
  
          // 获取单个加密货币的供应信息
          const supplyResponse = await graphqlClient.request(GetCoinsWithSupplyDocument, supplyVariables);
          const supplyData = supplyResponse.rapaidapi.coinSupplyResponse.data.supply;
  
          // 构建新的加密货币对象，包含供应信息，并添加到数组中
          const coinWithSupply = {
            ...coin,
            circulatingSupply: supplyData.circulatingAmount,
            maxSupply: supplyData.maxAmount,
          };
  
          coinsWithSupply.push(coinWithSupply);
  
          // 延迟以避免过快发送请求
          await delay(50);
        }
  
        // 更新状态以渲染带有供应信息的加密货币列表
        setCryptos(coinsWithSupply);
      } catch (error) {
        console.error('Fetching cryptos failed', error);
      }
    };
  
    fetchCryptos();
  }, [currentPage, limit]);
  


const nextPage = () => setCurrentPage((prev) => prev + 1);
const prevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));

return (
  <div>
    <header className="header">Top Market Data</header>
    <div className="table-container">
      <CryptoTable cryptos={cryptos} />
    </div>
    <div className="button-container">
      <button className = "button" onClick={prevPage}  disabled={currentPage === 1}>Prev</button>
      <span style={{ color: 'black' }}> Page {currentPage} </span>
      <button className = "button" onClick={nextPage}>Next</button>
    </div>
  </div>
);
};
export default App;