import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import './styles.css'
import logo from '../../assets/logo.svg'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api'
import axios from 'axios'
import { LeafletMouseEvent } from 'leaflet';

interface City {
    id: number;
    nome: string;
}

interface State {
    id: number;
    sigla: string;
}

interface Item {
    id: number;
    name: string;
    image_url: string;
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [selectedState, setSelectedState] = useState('0');
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedMapPosition, setSelectedMapPosition] = useState<[number, number]>([0, 0]);
    const [selectedMapInitilPosition, setSelectedMapInitialPosition] = useState<[number, number]>([0, 0]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const history = useHistory();

    useEffect(() => {
        api.get('items').then(resp => {
            setItems(resp.data);
        });
    }, []);

    useEffect(() => {
        axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(resp => {
            setStates(resp.data);
        });
    }, []);

    useEffect(() => {
        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`).then(resp => {
            setCities(resp.data)
        });
    }, [selectedState]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            setSelectedMapInitialPosition([position.coords.latitude, position.coords.longitude]);
        });
    }, [])

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedState(event.target.value)
    }

    function handleSelectCidade(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedCity(event.target.value)
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedMapPosition([event.latlng.lat, event.latlng.lng]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { id, value } = event.target;
        setFormData({ ...formData, [id]: value })
    }

    function handleSelectedItem(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item == id);
        if (alreadySelected > -1) {
            const filtered = selectedItems.filter(item => item != id);
            setSelectedItems(filtered);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const { name, email, whatsapp } = formData;
        const uf = selectedState;
        const cidade = selectedCity;
        const [latitude, longitude] = selectedMapPosition;
        const items = selectedItems;
        const data = {
            name,
            email,
            whatsapp,
            uf,
            city: cidade,
            latitude,
            longitude,
            items
        };
        await api.post('points', data);
        history.push('/')
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} />
                <Link to="/">
                    <FiArrowLeft />
                    Voltar
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do ponto de coleta</h1>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text"
                            onChange={handleInputChange}
                            id="name" />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="name">E-mail</label>
                            <input type="email"
                                onChange={handleInputChange}
                                id="email" />
                        </div>

                        <div className="field">
                            <label htmlFor="name">WhatsApp</label>
                            <input type="text"
                                onChange={handleInputChange}
                                id="whatsapp" />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={selectedMapInitilPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedMapPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">UF</label>
                            <select onChange={handleSelectUf} value={selectedState} name="uf" id="uf">
                                <option value="0">Selecione uma UF</option>
                                {states.map(uf => {
                                    return <option value={uf.sigla}>{uf.sigla}</option>
                                })}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select onChange={handleSelectCidade} value={selectedCity} name="city" id="city">
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(cidade => {
                                    return <option value={cidade.nome}>{cidade.nome}</option>;
                                })}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => {
                            return (
                                <li key={item.id} onClick={() => handleSelectedItem(item.id)}
                                    className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                    <img src={item.image_url} alt={item.name} />
                                    <span>{item.name}</span>
                                </li>)
                        })}
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar</button>
            </form>
        </div>
    );
}

export default CreatePoint;