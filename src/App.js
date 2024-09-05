import './App.css';
import React, { useState, useEffect } from 'react';
import "./../node_modules/bootstrap/dist/css/bootstrap.min.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

import { places, layout } from './data/sourcedata'; // Import odpowiednich danych

const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan', 'magenta', 'blue'];

function App() {
  const [activeExhibitor, setActiveExhibitor] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const handleMouseEnter = (exhibitor, e) => {
    setActiveExhibitor(exhibitor);
    console.log("Exhibitor:", exhibitor);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setActiveExhibitor(null);
  };

  useEffect(() => {
    const updateContainerSize = () => {
      const width = window.innerWidth - 20; // Możesz dostosować te wartości
      const height = window.innerHeight - 20;
      setContainerSize({ width, height });
    };

    window.addEventListener('resize', updateContainerSize);
    updateContainerSize(); // Initial calculation on mount

    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  const buttonsPerRow = layout[0].length;  // Ilość kolumn (długość pierwszego wiersza)
  const buttonsPerColumn = layout.length;  // Ilość wierszy (długość layoutu)

  // Rozmiar przycisków na podstawie rozmiaru kontenera
  const buttonWidth = (containerSize.width / buttonsPerRow)*0.9;
  const buttonHeight = (containerSize.height / buttonsPerColumn)*0.9;

  const backgroundWidth = buttonWidth * buttonsPerRow;
  const backgroundHeight = buttonHeight * buttonsPerColumn;

  const renderButtons = () => {
    const buttons = [];
    const visited = Array.from({ length: layout.length }, () => Array(layout[0].length).fill(false));

    let colorIndex = 0;

    layout.forEach((row, rowIndex) => {
      row.forEach((id, colIndex) => {
        if (id !== 0 && !visited[rowIndex][colIndex]) {
          let width = 1;
          let height = 1;
          visited[rowIndex][colIndex] = true;

          // Sprawdzenie szerokości przycisku (poziome łączenie)
          while (colIndex + width < layout[rowIndex].length && layout[rowIndex][colIndex + width] === id) {
            visited[rowIndex][colIndex + width] = true;
            width++;
          }

          // Sprawdzenie wysokości przycisku (pionowe łączenie)
          while (rowIndex + height < layout.length && layout[rowIndex + height][colIndex] === id) {
            let match = true;
            for (let i = 0; i < width; i++) {
              if (layout[rowIndex + height][colIndex + i] !== id) {
                match = false;
                break;
              }
            }
            if (match) {
              for (let i = 0; i < width; i++) {
                visited[rowIndex + height][colIndex + i] = true;
              }
              height++;
            } else {
              break;
            }
          }

          const place = places.find((ex) => ex.id === id);
          if (place) {
            const backgroundColor = 
            width > 1 || height > 1 
              ? colors[colorIndex++ % colors.length] 
              : place.special && place.firma.startsWith('Wej') 
                ? 'darkgreen' 
                : !place.special && !place.firma.startsWith('wolne') 
                  ? 'darkred' 
                  : place.special && place.firma.startsWith('wolne') 
                    ? 'gold' 
                    : !place.special && place.firma.startsWith('wolne') 
                      ? place.color 
                      : colors[colorIndex++ % colors.length];

            buttons.push(
              <button
                key={`${id}-${rowIndex}-${colIndex}`}
                className="exhibitor-button"
                onMouseEnter={(e) => handleMouseEnter(place, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  left: `${colIndex * buttonWidth}px`,
                  top: `${rowIndex * buttonHeight}px`,
                  width: `${width * buttonWidth}px`,
                  height: `${height * buttonHeight}px`,
                  backgroundColor,
                  opacity: 0.9,
                  fontSize: place.firma.startsWith('wolne') ? '0.6em' : '0.4em',
                }}
                onClick={() => {
                  if (activeExhibitor.strona) {
                    window.open(activeExhibitor.strona, '_blank');
                  }
                }}>
                {place.placeholder !== '' ? place.placeholder : place.id}
                
              </button>
            );
          }
        }
      });
    });

    return buttons;
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="row d-flex"> <div className='col-6'>
          <img
            src="https://expoarenanorge.no/wp-content/uploads/elementor/thumbs/LOGO-expo_arena-260px-bt-qqbr4qj1yjaptzkdhv8nu65jf5s1rc10m4o9nfkgyk.png"
            title="LOGO-expo_arena-260px-bt"
            alt="LOGO-expo_arena-260px-bt"
            loading="lazy"
            
            style={{
              marginBottom: "50px", width: '100px', display: 'inline'
            }}
          /></div><div className='col-6'>
          <h1 style={{margin: '10px', color: '#caab6d',marginBottom: "50px", }}>Mapa targów</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-10">
            <div className="exposition" style={{
                  position: 'relative',                  
                  height: `${backgroundHeight}px`,
                  width: `${backgroundWidth}px`,
                 
                  border: '10px solid #caab6d',
                  borderRadius: '2%',
                 
                  overflow: 'visible',
                  
                  backgroundSize: '100% 100%', // Dynamiczne ustawienie rozmiaru tła
                  padding: 0,
                  margin: 0,
                  boxSizing: 'content-box'
                  
                  
                }}>
              <div>
                <div className="button-container">{renderButtons()}</div>
              </div>
            </div>
          </div>
        </div>
       
        {activeExhibitor && (
  <div
    className="exhibitor-modal"
    style={{
      top: mousePosition.y + 10,
      left: mousePosition.x + 10,
      cursor: 'pointer', // Dodaj kursor wskazujący na możliwość klikania
    }}

  >
            <h3 style={{fontSize: '14px', color: 'black'}}>{activeExhibitor.firma}</h3>
            <p style={{ fontSize: '14px', color: 'black' }}>
  {activeExhibitor.firma.startsWith('wolne')
    ? (activeExhibitor.special
        ? 'Zarezerwuj miejsce premium tel 40424444'
        : 'Zarezerwuj miejsce zwykle tel 40424444')
    : activeExhibitor.branza}
</p>
            
          </div>
        )}
        
      </header>
    </div>
  );
}

export default App;
