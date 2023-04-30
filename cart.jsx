// simulate getting products from DataBase
const products = [
  { id: 1, name: "apples", country: "Italy", cost: 3, instock: 10, displayName: "Apples, Each" },
  { id: 2, name: "oranges", country: "Spain", cost: 4, instock: 3, displayName: "Navel Oranges, 4lb Bag" },
  { id: 3, name: "beans", country: "USA", cost: 2, instock: 5, displayName: "Great Value Pinto Beans, 15.5 oz Can" },
  { id: 4, name: "cabbage", country: "USA", cost: 1, instock: 8, displayName: "Organic Fresh Green Cabbage, Each" },
];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data
  const addToCart = (e) => {
    let id = e.target.id;
    let itemsFiltered = items.filter((item) => item.id == id);
    if (itemsFiltered.length == 0) {
      return;
    }
    const itemToCart = itemsFiltered[0];
    if (itemToCart.instock == 0) {
      alert("Sorry, the product " + itemToCart.name + " is sold out in the list. \nPlease click restock to replenish the stock first");
      return;
    }

    console.log(`add to Cart ${JSON.stringify(itemsFiltered)}`);
    setCart([...cart, ...itemsFiltered]);
    // set the items state which should change the
    const newItems = items.map((item) => {
      if (item.id === id) {
        // this item instock should be minus 1
        item.instock = item.instock - 1;
      }
      return item;
    })

    setItems(newItems);
    //doFetch(query);
  };
  const deleteCartItem = (index) => {
    let newCart = cart.filter((item, i) => index != i);
    setCart(newCart);
  };
  const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  let list = items.map((item, index) => {
    //let n = index + 1049;
    //let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <li key={index}>
        <div style={{ display: "grid" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Image src={photos[index % 4]} width={70} roundedCircle></Image>
          </div>
          <Button variant="light" size="large" type="submit" onClick={() => addToCart({ target: { id: item.id } })}>
            {item.displayName}<br />
            price: ${item.cost}<br />
            current stock: {item.instock}
          </Button>
        </div>
      </li>
    );
  });
  let cartList = cart.map((item, index) => {
    return (
      <Accordion.Item key={1 + index} eventKey={1 + index}>
        <Accordion.Header >
          {item.displayName}
        </Accordion.Header>
        <Accordion.Body onClick={() => deleteCartItem(index)}
          eventKey={1 + index}>
          $ {item.cost} from {item.country}
        </Accordion.Body>
      </Accordion.Item>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.displayName}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    // this function replenish all the proucts to the predetermined stock quantity
    // get the data from online database
    doFetch(url);
    // essentially a useState setUrl function, which will trigger the useEffect setup function, 
    // and use axios to download the database and also trigger to call dispatch with action type SUCCESS which reflect in state 
    console.log("data =" + JSON.stringify(data));
    // now extract the necessary information to get the data
    // data.data.attributes.Name.restock
    // get the id and restock amount
    const restockData = data.data;
    // set the set state items
    const newItems = restockData.map((i) => {
      // now construct a list of object name, 
      const attr = i.attributes;
      return { name: attr.name, displayName: attr.display_name, country: attr.country, cost: attr.cost, instock: attr.instock }

    });

    setItems(newItems);


  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion defaultActiveKey="0">{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:1337/api/products`);
            console.log(`Restock called on server ${query}`);
            event.preventDefault();
          }}
        >
          <label for="dataBaseUrlInput">
            Database URL:
          </label>
          <input
            id="dataBaseUrlInput"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
