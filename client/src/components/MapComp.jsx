import React from 'react'
import axios from 'axios'
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
} from 'react-leaflet'
import { useMemo } from 'react';
const fetchData = async (url) => {
    const response = await axios.get(url)
    return response.data
}
export default function MapComp() {
    const [mapData, setMapData] = React.useState(null)
    const [positions, setPosition] = React.useState([])
    const [error, setError] = React.useState(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchDataAndSetState = async () => {
            try {
                const data = await fetchData('http://localhost:4000/location')
                setMapData(data.data != null ? JSON.stringify(data.data).toString() : [])
                setIsLoading(false)
            } catch (error) {
                setError(error)
                setIsLoading(false)
            }
        }
        fetchDataAndSetState()
    }, [])

    useMemo(() => {
        if (mapData != null) {
            const data = JSON.parse(mapData)
            // toObject
            const obj = data.map(item => {
                // parse to object
                const obj = JSON.parse(item)
                return obj
            })
            const pos = obj.map(item => {
                return [item.lat, item.lon]
            }
            )
            setPosition(pos)
        }
    }, [mapData])
    return (
        <div>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    {error ? (
                        <div>{error.message}</div>
                    ) : (
                        <div style={{
                            height: '100vh',
                            width: '100%'

                        }}
                        >
                            <MapContainer
                                center={[30.1569, 71.5218]}
                                zoom={6}
                                style={{
                                    height: '100%',
                                    width: '100%'
                                }}
                            >
                                <TileLayer
                                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {positions?.map((item, index) => {
                                    return (
                                        <Marker key={index} position={item}
                                            icon={
                                                L.icon({
                                                    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                                                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                                    iconSize: [29, 48],
                                                    iconAnchor: [12, 41],
                                                    popupAnchor: [1, -34],
                                                    shadowSize: [41, 41]
                                                })
                                            }
                                        >
                                            <Popup>
                                                {
                                                    `Lat = ${item[0]}, log = ${item[1]}`
                                                }
                                            </Popup>
                                        </Marker>
                                    )
                                })}
                            </MapContainer>
                        </div>
                    )}
                </div>
            )
            }
        </div >
    )
}
