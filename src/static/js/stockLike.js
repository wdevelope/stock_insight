document.addEventListener('DOMContentLoaded', function () {
  fetchFavoriteStocks();
});

async function fetchFavoriteStocks() {
  try {
    const response = await fetch('/api/stocks/mystock', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch favorite stocks.');
    }

    const stocks = await response.json();
    displayFavoriteStocks(stocks);
  } catch (error) {
    console.error('Error fetching favorite stocks:', error);
  }
}

// 즐겨찾기 카드 렌더링
function displayFavoriteStocks(stocks) {
  const cardsContainer = document.querySelector('.cards-container');
  cardsContainer.innerHTML = '';

  const cardRow = document.createElement('div');
  cardRow.className = 'row';
  cardsContainer.appendChild(cardRow);

  stocks.forEach((stock, index) => {
    const priceChange = stock.prdy_ctrt;
    let priceChangeColor;
    if (priceChange > 0) {
      priceChangeColor = '#f3722ca5';
    } else if (priceChange < 0) {
      priceChangeColor = '#a3cef1';
    } else {
      priceChangeColor = '#b0b5c2b7';
    }

    const card = `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                    <div class="card" style="height: auto; max-height: 500px; background-color:${priceChangeColor}; border: none; display: flex; flex-direction: column;" onclick="navigateToStockDetail('${
                      stock.stockId
                    }')">
                    <div class="card-header">
                      ${stock.prdt_abrv_name} <br>(${stock.stockId})
                      <span class="delete-button" style="position: absolute; top: 5px; right: 5px; cursor: pointer;" onclick="event.stopPropagation(); deleteMyStock('${
                        stock.stockId
                      }');">X</span>
                    </div>
                    <div class="card-body flex-grow-1" style="position: relative; display: flex; flex-direction: column;">                
                      <canvas id="stock-chart-${index}" style="position: relative; flex-grow: 1;"></canvas>
                      <h4 class="card-subtitle mb-2 text-muted">
                        <br>
                        <span class="current-price-text">현재가</span> 
                        <br/>
                        <span class="current-price-value">${parseInt(
                          stock.stck_prpr,
                          10,
                        ).toLocaleString()} 원</span>
                        <span class="current-price-value">(${priceChange.toLocaleString()}%)</span> 
                      </h4>
                    </div>
                  </div>
                </div>
              `;

    cardRow.innerHTML += card;
    setTimeout(() => {
      const canvasElement = document.getElementById(`stock-chart-${index}`);
      renderChartForFavorite(canvasElement, stock.prices);
    }, 0);
  });
}

// 차트 만들기
function renderChartForFavorite(canvasElement, chartData) {
  chartData = chartData.reverse();

  const labels = chartData.map((data) => {
    const date = new Date(data.date);
    date.setHours(date.getHours() + 9);
    date.setMinutes(date.getMinutes());
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  });
  const prices = chartData.map((data) => data.price);

  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const padding = (maxPrice - minPrice) * 0.05;

  new Chart(canvasElement, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          data: prices,
          borderWidth: 1,
          borderColor: 'white',
          fill: true,
          pointRadius: 0,
          showLine: true,
          label: '',
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          min: minPrice - padding,
          max: maxPrice + padding,
        },
      },
    },
  });
}

// 즐겨찾기 종목 지우기
async function deleteMyStock(stockId) {
  try {
    const response = await fetch(`/api/stocks/mystock/${stockId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete the stock from favorites.');
    }

    // 삭제 후 목록을 다시 로드
    fetchFavoriteStocks();
  } catch (error) {
    console.error('Error:', error);
  }
}

function navigateToStockDetail(id) {
  window.location.href = `stocksInfo?id=${id}`;
}
