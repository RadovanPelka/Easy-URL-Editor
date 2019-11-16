import React from "react";
import Stack from "@kiwicom/orbit-components/lib/Stack";
import InputField from "@kiwicom/orbit-components/lib/InputField";
import OrbitTextLink from "@kiwicom/orbit-components/lib/TextLink";
import styled from "styled-components";
import CONFIG from "../config";
import Option from "./buttons/Option";

const TextLink = styled(OrbitTextLink)`
  color: #5f738c;
  text-decoration: none !important;
`;

const UrlComponent = ({ copied, copyValue, rebuildUrl, applyOriginalUrl }) => (
  <React.Fragment>
    <Stack direction="row" spacing="none">
      <InputField
        label="Final URL:"
        inlineLabel
        size="small"
        readOnly
        spaceAfter="small"
        value={rebuildUrl()}
        placeholder={CONFIG.INPUT_PLACEHOLDER}
      />
      <Option
        size="small"
        type="secondary"
        onClick={() => copyValue("finalUrl", rebuildUrl())}
        tabIndex="-1"
      >
        {copied === "finalUrl" ? "Copied" : "Copy"}
      </Option>
    </Stack>
    <Stack direction="row" justify="end" spaceAfter="small" spacing="tight">
      <TextLink
        size="small"
        type="secondary"
        onClick={applyOriginalUrl}
        tabIndex="-1"
      >
        Reset URL and Params
      </TextLink>
    </Stack>
  </React.Fragment>
);

export default UrlComponent;
