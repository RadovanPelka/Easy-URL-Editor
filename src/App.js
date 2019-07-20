import React, { useState, useEffect, useMemo, memo } from "react";
import Layout, { LayoutColumn } from "@kiwicom/orbit-components/lib/Layout";
import Stack from "@kiwicom/orbit-components/lib/Stack";
import InputGroup from "@kiwicom/orbit-components/lib/InputGroup";
import InputField from "@kiwicom/orbit-components/lib/InputField";
import Loading from "@kiwicom/orbit-components/lib/Loading";
import Separator from "@kiwicom/orbit-components/lib/Separator";
import Text from "@kiwicom/orbit-components/lib/Text";
import OrbitTextLink from "@kiwicom/orbit-components/lib/TextLink";
import Button from "@kiwicom/orbit-components/lib/Button";
import styled from "styled-components";
import uuidV4 from "uuid/v4";
import copy from "copy-to-clipboard";
import * as R from "ramda";

import UrlComponent from "./components/UrlComponent";

const DEFAULT_URL = "http://localhost:3000/page?id=test&name=rado";

const TextLink = styled(OrbitTextLink)`
  color: #5f738c;
  text-decoration: none !important;
`;

const Option = styled(Button)`
  border: 1px solid #b9c8d6;
  background-color: white;
  margin-left: -4px;
  color: #5f738c !important;
  font-weight: 200;
`;

const newGuID = () => uuidV4().split("-")[0];
const decode = input => decodeURIComponent(input);
const encode = input => encodeURIComponent(input);

const setupParams = fullUrl => {
  const urlArray = fullUrl.split("?");

  return urlArray.length === 1
    ? []
    : urlArray[1].split("&").map(param => {
        const [key, value] = param.split("=");
        return { id: newGuID(), key: decode(key), value: decode(value) };
      });
};
const prepareParams = (fullUrl = DEFAULT_URL) => {
  const urlArray = fullUrl.split("?");

  return {
    loading: false,
    url: {
      org: fullUrl,
      page: urlArray[0],
      params: urlArray.length === 1 ? "" : urlArray[1]
    },
    params: setupParams(fullUrl)
  };
};

const App = () => {
  const [localStore, setLocalStore] = useState({
    loading: true,
    url: {
      org: "",
      page: "",
      params: ""
    },
    params: [],
    copied: false
  });

  useEffect(() => {
    try {
      chrome.tabs.getSelected(null, function(tab) {
        setLocalStore(prepareParams(tab.url));
      });
    } catch (err) {
      setLocalStore(prepareParams());
    }
  }, []);

  useEffect(() => {
    if (localStore.copied)
      setTimeout(() => {
        setLocalStore(prev => ({ ...prev, copied: null }));
      }, 2000);
  }, [localStore.copied]);

  const applyOriginalUrl = () =>
    setLocalStore(prepareParams(localStore.url.org));

  const applyOriginalParams = () =>
    setLocalStore(prev => ({ ...prev, params: setupParams(prev.url.org) }));

  const applyOriginalPage = () =>
    setLocalStore(prev => ({
      ...prev,
      url: { ...prev.url, page: prev.url.org.split("?")[0] }
    }));

  const deleteParam = id =>
    setLocalStore(prev => ({
      ...prev,
      params: prev.params.filter(param => param.id !== id)
    }));

  const updateParam = (id, e) => {
    const { name, value } = e.target;
    setLocalStore(prev => ({
      ...prev,
      params: prev.params.map(param => {
        if (param.id === id) param[name] = value;
        return param;
      })
    }));
  };

  const rebuildUrl = () => {
    const {
      url: { page },
      params
    } = localStore;

    const finalParams = params
      .map(({ key, value }) => {
        if (R.isEmpty(key)) return false;
        else if (R.isEmpty(key) && R.isEmpty(value)) return false;
        else if (!R.isEmpty(key) && R.isEmpty(value)) return encode(key);

        return `${encode(key)}=${encode(value)}`;
      })
      .filter(p => p);

    return `${page}${
      finalParams.length !== 0 ? "?" + finalParams.join("&") : ""
    }`;
  };

  const addNewParam = () =>
    setLocalStore(prev => ({
      ...prev,
      params: [...prev.params, { id: newGuID(), key: "", value: "" }]
    }));

  const copyValue = (id, value) => {
    setLocalStore(prev => ({ ...prev, copied: id }));
    copy(value);
  };

  const focusLast = key => {
    if (!key)
      setTimeout(() => {
        document.querySelector("[id=last]").focus();
      }, 10);
    return "last";
  };

  const navigate = () => {
    chrome.tabs.update({ url: rebuildUrl() });
    window.close();
  };

  const changeUrl = e => {
    const { value: page } = e.target;
    setLocalStore(prev => ({ ...prev, url: { ...prev.url, page } }));
  };

  const keyUp = e => e.keyCode === 13 && navigate();

  return (
    <Layout type="MMB">
      <LayoutColumn>
        {localStore.loading ? (
          <Loading />
        ) : (
          <React.Fragment>
            <Text spaceAfter="small">Final URL</Text>
            <Stack direction="row" spacing="none">
              <InputField
                size="small"
                readOnly
                spaceAfter="small"
                value={rebuildUrl()}
                placeholder="https://google.com/search?q=chrome+extension+easy+url+editor"
              />
              <Option
                size="small"
                type="secondary"
                onClick={() => copyValue("finalUrl", rebuildUrl())}
              >
                {localStore.copied === "finalUrl" ? "Copied" : "Copy"}
              </Option>
            </Stack>
            <Stack
              direction="row"
              justify="end"
              spaceAfter="small"
              spacing="tight"
            >
              <TextLink
                size="small"
                type="secondary"
                onClick={applyOriginalUrl}
              >
                Reset URL with Params
              </TextLink>
            </Stack>
            <Separator />
            <UrlComponent
              page={localStore.url.page}
              onChangeUrl={changeUrl}
              copied={localStore.copied}
              applyOriginalPage={applyOriginalPage}
              copyValue={copyValue}
            />
            <Separator />
            <Text spaceAfter="small">
              Params{" "}
              {localStore.params.length !== 0 &&
                `(${localStore.params.length})`}
            </Text>
            <Stack direction="column" spacing="tight">
              {localStore.params.map((param, i) => (
                <Stack key={param.id} direction="row" spacing="none">
                  <InputGroup
                    onChange={e => updateParam(param.id, e)}
                    flex={["1 0 30%", "1 1 70%"]}
                    size="small"
                  >
                    <InputField
                      id={
                        localStore.params.length - 1 === i &&
                        focusLast(param.key)
                      }
                      type="text"
                      name="key"
                      value={param.key}
                      placeholder="Key"
                      onKeyUp={keyUp}
                    />
                    <InputField
                      type="text"
                      name="value"
                      value={param.value}
                      placeholder="Value"
                      onKeyUp={keyUp}
                    />
                  </InputGroup>
                  <Option
                    size="small"
                    type="secondary"
                    onClick={() => copyValue(param.id, param.value)}
                  >
                    {localStore.copied === param.id ? "Copied" : "Copy"}
                  </Option>
                  <Option
                    size="small"
                    type="secondary"
                    onClick={() => deleteParam(param.id)}
                  >
                    X
                  </Option>
                </Stack>
              ))}
              <Stack direction="row" justify="end" spacing="tight">
                <Button
                  onClick={applyOriginalParams}
                  size="small"
                  type="secondary"
                >
                  Reset Params
                </Button>
                <Button onClick={addNewParam} size="small" type="secondary">
                  ADD
                </Button>
              </Stack>
              <Separator />
              <Stack direction="row" justify="end">
                <Button block onClick={navigate} type="secondary">
                  Go
                </Button>
              </Stack>
            </Stack>
          </React.Fragment>
        )}
      </LayoutColumn>
    </Layout>
  );
};

export default App;
