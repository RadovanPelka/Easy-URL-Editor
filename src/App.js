import React, { useState, useEffect, useCallback } from "react";
import Layout, { LayoutColumn } from "@kiwicom/orbit-components/lib/Layout";
import Stack from "@kiwicom/orbit-components/lib/Stack";
import InputGroup from "@kiwicom/orbit-components/lib/InputGroup";
import InputField from "@kiwicom/orbit-components/lib/InputField";
import Loading from "@kiwicom/orbit-components/lib/Loading";
import Separator from "@kiwicom/orbit-components/lib/Separator";
import Text from "@kiwicom/orbit-components/lib/Text";
import Button from "@kiwicom/orbit-components/lib/Button";
import styled from "styled-components";
import uuidV4 from "uuid/v4";
import copy from "copy-to-clipboard";
import * as R from "ramda";
import CONFIG from "./config";

import FinalURLComponent from "./components/FinalURLComponent";
import UrlComponent from "./components/UrlComponent";
import Option from "./components/buttons/Option";

const Space = styled.div`
  height: 15px;
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
const prepareParams = (fullUrl = CONFIG.DEFAULT_URL) => {
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
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          setLocalStore(prepareParams(tabs[0].url));
        } else {
          setLocalStore(prepareParams());
        }
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

  const applyOriginalUrl = useCallback(
    () => setLocalStore(prepareParams(localStore.url.org)),
    [localStore.loading]
  );

  const applyOriginalParams = useCallback(
    () =>
      setLocalStore(prev => ({ ...prev, params: setupParams(prev.url.org) })),
    [localStore.loading]
  );

  const applyOriginalPage = useCallback(
    () =>
      setLocalStore(prev => ({
        ...prev,
        url: { ...prev.url, page: prev.url.org.split("?")[0] }
      })),
    [localStore.loading]
  );

  const deleteParam = useCallback(
    id =>
      setLocalStore(prev => ({
        ...prev,
        params: prev.params.filter(param => param.id !== id)
      })),
    [localStore.url.params, localStore.params]
  );

  const updateParam = useCallback(
    (id, e) => {
      const { name, value } = e.target;
      setLocalStore(prev => ({
        ...prev,
        params: prev.params.map(param => {
          if (param.id === id) param[name] = value;
          return param;
        })
      }));
    },
    [localStore.url.params, localStore.params]
  );

  const rebuildUrl = useCallback(() => {
    const {
      url: { page },
      params
    } = localStore;

    const finalParams = params
      .map(({ key, value }) => {
        if (R.isEmpty(key) || (R.isEmpty(key) && R.isEmpty(value)))
          return false;
        else if (!R.isEmpty(key) && R.isEmpty(value)) return encode(key);

        return `${encode(key)}=${encode(value)}`;
      })
      .filter(p => p);

    return `${page}${
      finalParams.length !== 0 ? "?" + finalParams.join("&") : ""
    }`;
  }, [localStore.params, localStore.url.page]);

  const addNewParam = useCallback(
    () =>
      setLocalStore(prev => ({
        ...prev,
        params: [...prev.params, { id: newGuID(), key: "", value: "" }]
      })),
    [localStore.params, localStore.url.params]
  );

  const copyValue = useCallback((id, value) => {
    setLocalStore(prev => ({ ...prev, copied: id }));
    copy(value);
  }, []);

  const focusLastInput = useCallback(key => {
    if (!key)
      setTimeout(() => {
        document.querySelector("[id=last]").focus();
      }, 10);
    return "last";
  }, []);

  const navigate = () => {
    chrome.tabs.update({ url: rebuildUrl() });
    window.close();
  };

  const changeUrl = useCallback(e => {
    const { value: page } = e.target;
    setLocalStore(prev => ({ ...prev, url: { ...prev.url, page } }));
  }, []);

  const keyDown = e => e.keyCode === 13 && navigate();

  return (
    <Layout type="MMB">
      <LayoutColumn>
        {localStore.loading ? (
          <Loading />
        ) : (
          <React.Fragment>
            <Space />
            <FinalURLComponent
              applyOriginalUrl={applyOriginalUrl}
              rebuildUrl={rebuildUrl}
              copied={localStore.copied}
              copyValue={copyValue}
            />
            <UrlComponent
              page={localStore.url.page}
              onChangeUrl={changeUrl}
              copied={localStore.copied}
              applyOriginalPage={applyOriginalPage}
              copyValue={copyValue}
              onKeyDown={keyDown}
            />
            <Separator />
            <Text spaceAfter="small">
              Params
              {localStore.params.length !== 0 &&
                ` (${localStore.params.length})`}
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
                        focusLastInput(param.key)
                      }
                      type="text"
                      name="key"
                      value={param.key}
                      placeholder="Key"
                      onKeyDown={keyDown}
                    />
                    <InputField
                      type="text"
                      name="value"
                      value={param.value}
                      placeholder="Value"
                      onKeyDown={keyDown}
                    />
                  </InputGroup>
                  <Option
                    size="small"
                    type="secondary"
                    onClick={() => copyValue(param.id, param.value)}
                    tabIndex="-1"
                  >
                    {localStore.copied === param.id ? "Copied" : "Copy"}
                  </Option>
                  <Option
                    size="small"
                    type="secondary"
                    onClick={() => deleteParam(param.id)}
                    tabIndex="-1"
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
                  tabIndex="-1"
                >
                  Reset Params ({localStore.params.length})
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
