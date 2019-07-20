import React from "react";
import Stack from "@kiwicom/orbit-components/lib/Stack";
import InputField from "@kiwicom/orbit-components/lib/InputField";
import Text from "@kiwicom/orbit-components/lib/Text";
import Button from "@kiwicom/orbit-components/lib/Button";
import OrbitTextLink from "@kiwicom/orbit-components/lib/TextLink";
import styled from "styled-components";

const Option = styled(Button)`
  border: 1px solid #b9c8d6;
  background-color: white;
  margin-left: -4px;
  color: #5f738c !important;
  font-weight: 200;
`;

const TextLink = styled(OrbitTextLink)`
  color: #5f738c;
  text-decoration: none !important;
`;

const UrlComponent = ({
  page,
  onChangeUrl,
  copied,
  applyOriginalPage,
  copyValue
}) => (
  <React.Fragment>
    <Text spaceAfter="small">URL</Text>
    <Stack direction="row" spaceAfter="small" spacing="none">
      <InputField
        size="small"
        value={page}
        onChange={onChangeUrl}
        placeholder="https:/google.com"
      />
      <Option
        size="small"
        type="secondary"
        onClick={() => copyValue("url", page)}
      >
        {copied === "url" ? "Copied" : "Copy"}
      </Option>
    </Stack>
    <Stack direction="row" justify="end" spaceAfter="small" spacing="tight">
      <TextLink size="small" type="secondary" onClick={applyOriginalPage}>
        Reset URL
      </TextLink>
    </Stack>
  </React.Fragment>
);

export default UrlComponent;
