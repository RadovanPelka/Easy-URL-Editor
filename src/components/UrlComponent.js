import React from "react";
import Stack from "@kiwicom/orbit-components/lib/Stack";
import InputField from "@kiwicom/orbit-components/lib/InputField";
import Option from "../components/buttons/Option";

const UrlComponent = ({
  page,
  onChangeUrl,
  copied,
  applyOriginalPage,
  copyValue,
  onKeyDown
}) => (
  <Stack direction="row" spaceAfter="small" spacing="none">
    <InputField
      label="URL:"
      inlineLabel
      size="small"
      value={page}
      onChange={onChangeUrl}
      placeholder="https:/google.com"
      onKeyDown={onKeyDown}
    />
    <Option
      size="small"
      type="secondary"
      onClick={() => copyValue("url", page)}
      tabIndex="-1"
    >
      {copied === "url" ? "Copied" : "Copy"}
    </Option>
    <Option
      size="small"
      type="secondary"
      onClick={applyOriginalPage}
      tabIndex="-1"
    >
      Reset
    </Option>
  </Stack>
);

export default UrlComponent;
